from typing import Any, Dict, List, Optional
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from functools import wraps
import time
import logging

logger = logging.getLogger(__name__)

class QueryOptimizer:
    """Utility class for database query optimization"""
    
    @staticmethod
    def with_eager_loading(query, *relationships):
        """Add eager loading to prevent N+1 queries"""
        for relationship in relationships:
            if isinstance(relationship, str):
                query = query.options(selectinload(relationship))
            else:
                query = query.options(relationship)
        return query
    
    @staticmethod
    def with_joined_loading(query, *relationships):
        """Add joined loading for better performance with related data"""
        for relationship in relationships:
            if isinstance(relationship, str):
                query = query.options(joinedload(relationship))
            else:
                query = query.options(relationship)
        return query
    
    @staticmethod
    async def execute_with_pagination(
        session: AsyncSession,
        query,
        page: int = 1,
        page_size: int = 20,
        max_page_size: int = 100
    ):
        """Execute query with optimized pagination"""
        # Limit page size to prevent abuse
        page_size = min(page_size, max_page_size)
        offset = (page - 1) * page_size
        
        # Get total count efficiently
        count_query = query.statement.with_only_columns([text('COUNT(*)')])
        total_result = await session.execute(count_query)
        total = total_result.scalar()
        
        # Get paginated results
        paginated_query = query.offset(offset).limit(page_size)
        result = await session.execute(paginated_query)
        items = result.scalars().all()
        
        return {
            'items': items,
            'total': total,
            'page': page,
            'page_size': page_size,
            'total_pages': (total + page_size - 1) // page_size
        }
    
    @staticmethod
    async def bulk_insert_optimized(session: AsyncSession, model_class, data_list: List[Dict]):
        """Optimized bulk insert operation"""
        if not data_list:
            return []
        
        # Use bulk insert for better performance
        result = await session.execute(
            model_class.__table__.insert().returning(model_class.id),
            data_list
        )
        await session.commit()
        return result.fetchall()
    
    @staticmethod
    async def bulk_update_optimized(
        session: AsyncSession, 
        model_class, 
        updates: List[Dict[str, Any]]
    ):
        """Optimized bulk update operation"""
        if not updates:
            return
        
        # Group updates by fields being updated for efficiency
        await session.execute(
            model_class.__table__.update(),
            updates
        )
        await session.commit()

def query_timer(func):
    """Decorator to log slow queries"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        result = await func(*args, **kwargs)
        execution_time = time.time() - start_time
        
        if execution_time > 1.0:  # Log queries taking more than 1 second
            logger.warning(f"Slow query detected: {func.__name__} took {execution_time:.2f}s")
        
        return result
    return wrapper

class DatabaseIndexes:
    """Database index recommendations and creation"""
    
    RECOMMENDED_INDEXES = [
        # Users table indexes
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active ON users(is_active);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);",
        
        # Leads table indexes
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_status ON leads(status);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_created_by ON leads(created_by);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_created_at ON leads(created_at);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_email ON leads(email);",
        
        # Tasks table indexes
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_assigned_by ON tasks(assigned_by);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_status ON tasks(status);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);",
        
        # Composite indexes for common queries
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_status_assigned ON leads(status, assigned_to);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_status_assigned ON tasks(status, assigned_to);",
        "CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role_active ON users(role, is_active);",
    ]
    
    @classmethod
    async def create_recommended_indexes(cls, session: AsyncSession):
        """Create all recommended indexes"""
        for index_sql in cls.RECOMMENDED_INDEXES:
            try:
                await session.execute(text(index_sql))
                logger.info(f"Created index: {index_sql}")
            except Exception as e:
                logger.warning(f"Failed to create index: {index_sql}, Error: {e}")
        
        await session.commit()

# Connection pool monitoring
class ConnectionPoolMonitor:
    """Monitor database connection pool health"""
    
    @staticmethod
    def get_pool_status(engine):
        """Get current connection pool status"""
        pool = engine.pool
        return {
            'size': pool.size(),
            'checked_in': pool.checkedin(),
            'checked_out': pool.checkedout(),
            'overflow': pool.overflow(),
            'invalid': pool.invalid(),
        }
    
    @staticmethod
    async def health_check(session: AsyncSession) -> Dict[str, Any]:
        """Perform database health check"""
        try:
            start_time = time.time()
            await session.execute(text("SELECT 1"))
            response_time = time.time() - start_time
            
            return {
                'status': 'healthy',
                'response_time_ms': round(response_time * 1000, 2),
                'timestamp': time.time()
            }
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': time.time()
            }