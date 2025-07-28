"""
Performance optimization initialization script
"""
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.database import AsyncSessionLocal
from app.utils.query_optimizer import DatabaseIndexes
import logging

logger = logging.getLogger(__name__)

async def initialize_performance_optimizations():
    """Initialize all performance optimizations"""
    try:
        async with AsyncSessionLocal() as session:
            logger.info("Starting performance optimization initialization...")
            
            # Create recommended database indexes
            await DatabaseIndexes.create_recommended_indexes(session)
            logger.info("Database indexes created successfully")
            
            # Analyze tables for better query planning
            await analyze_tables(session)
            logger.info("Table analysis completed")
            
            logger.info("Performance optimization initialization completed")
            
    except Exception as e:
        logger.error(f"Failed to initialize performance optimizations: {e}")
        raise

async def analyze_tables(session: AsyncSession):
    """Run ANALYZE on all tables for better query planning"""
    tables = ['users', 'leads', 'tasks', 'user_sessions']
    
    for table in tables:
        try:
            from sqlalchemy import text
            await session.execute(text(f"ANALYZE {table}"))
            logger.info(f"Analyzed table: {table}")
        except Exception as e:
            logger.warning(f"Failed to analyze table {table}: {e}")
    
    await session.commit()

async def vacuum_tables(session: AsyncSession):
    """Run VACUUM on tables to reclaim space and update statistics"""
    tables = ['users', 'leads', 'tasks', 'user_sessions']
    
    for table in tables:
        try:
            from sqlalchemy import text
            await session.execute(text(f"VACUUM ANALYZE {table}"))
            logger.info(f"Vacuumed table: {table}")
        except Exception as e:
            logger.warning(f"Failed to vacuum table {table}: {e}")

if __name__ == "__main__":
    asyncio.run(initialize_performance_optimizations())