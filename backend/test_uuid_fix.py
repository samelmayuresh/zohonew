#!/usr/bin/env python3
"""
Test UUID serialization fixes for all API endpoints
"""
import os
import sys
import asyncio
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

async def test_users_endpoint():
    """Test users API endpoint UUID serialization"""
    print("🧪 Testing Users API Endpoint")
    print("=" * 40)
    
    try:
        from app.utils.database import AsyncSessionLocal
        from app.models.user import User
        from app.schemas.user import UserResponse
        from sqlalchemy import select
        
        async with AsyncSessionLocal() as session:
            # Get users from database
            result = await session.execute(select(User).limit(5))
            users = result.scalars().all()
            
            print(f"📊 Found {len(users)} users in database")
            
            # Test serialization
            for user in users:
                try:
                    # Create UserResponse object
                    user_response = UserResponse.model_validate(user)
                    
                    # Test JSON serialization
                    json_data = user_response.model_dump()
                    json_str = json.dumps(json_data, default=str)
                    
                    print(f"✅ User {user.username}: ID serialized as {type(json_data['id']).__name__}")
                    
                    # Verify ID is string
                    if isinstance(json_data['id'], str):
                        print(f"   ✅ ID correctly serialized to string: {json_data['id']}")
                    else:
                        print(f"   ❌ ID not serialized to string: {json_data['id']} ({type(json_data['id'])})")
                        return False
                        
                except Exception as e:
                    print(f"   ❌ Serialization failed for user {user.username}: {e}")
                    return False
            
            print("✅ Users endpoint UUID serialization working correctly")
            return True
            
    except Exception as e:
        print(f"❌ Users endpoint test failed: {e}")
        return False

async def test_leads_endpoint():
    """Test leads API endpoint UUID serialization"""
    print("\n🧪 Testing Leads API Endpoint")
    print("=" * 40)
    
    try:
        from app.utils.database import AsyncSessionLocal
        from app.models.lead import Lead
        from app.schemas.lead import LeadResponse
        from sqlalchemy import select
        
        async with AsyncSessionLocal() as session:
            # Get leads from database
            result = await session.execute(select(Lead).limit(5))
            leads = result.scalars().all()
            
            print(f"📊 Found {len(leads)} leads in database")
            
            if len(leads) == 0:
                print("⚠️  No leads found - creating test lead")
                # Create a test lead for testing
                from app.models.user import User
                user_result = await session.execute(select(User).limit(1))
                user = user_result.scalar_one_or_none()
                
                if user:
                    test_lead = Lead(
                        first_name="Test",
                        last_name="Lead",
                        email="test@example.com",
                        company="Test Company",
                        status="new",
                        created_by=user.id
                    )
                    session.add(test_lead)
                    await session.commit()
                    await session.refresh(test_lead)
                    leads = [test_lead]
                    print("✅ Test lead created")
            
            # Test serialization
            for lead in leads:
                try:
                    # Create LeadResponse object
                    lead_response = LeadResponse.model_validate(lead)
                    
                    # Test JSON serialization
                    json_data = lead_response.model_dump()
                    json_str = json.dumps(json_data, default=str)
                    
                    print(f"✅ Lead {lead.first_name} {lead.last_name}:")
                    
                    # Verify UUID fields are strings
                    uuid_fields = ['id', 'created_by', 'assigned_to']
                    for field in uuid_fields:
                        if field in json_data and json_data[field] is not None:
                            if isinstance(json_data[field], str):
                                print(f"   ✅ {field} correctly serialized to string")
                            else:
                                print(f"   ❌ {field} not serialized to string: {type(json_data[field])}")
                                return False
                        
                except Exception as e:
                    print(f"   ❌ Serialization failed for lead {lead.id}: {e}")
                    return False
            
            print("✅ Leads endpoint UUID serialization working correctly")
            return True
            
    except Exception as e:
        print(f"❌ Leads endpoint test failed: {e}")
        return False

async def test_tasks_endpoint():
    """Test tasks API endpoint UUID serialization"""
    print("\n🧪 Testing Tasks API Endpoint")
    print("=" * 40)
    
    try:
        from app.utils.database import AsyncSessionLocal
        from app.models.task import Task
        from app.schemas.task import TaskResponse
        from sqlalchemy import select
        
        async with AsyncSessionLocal() as session:
            # Get tasks from database
            result = await session.execute(select(Task).limit(5))
            tasks = result.scalars().all()
            
            print(f"📊 Found {len(tasks)} tasks in database")
            
            if len(tasks) == 0:
                print("⚠️  No tasks found - creating test task")
                # Create a test task for testing
                from app.models.user import User
                user_result = await session.execute(select(User).limit(1))
                user = user_result.scalar_one_or_none()
                
                if user:
                    test_task = Task(
                        title="Test Task",
                        description="Test task for UUID serialization",
                        assigned_to=user.id,
                        assigned_by=user.id,
                        status="pending",
                        priority="medium"
                    )
                    session.add(test_task)
                    await session.commit()
                    await session.refresh(test_task)
                    tasks = [test_task]
                    print("✅ Test task created")
            
            # Test serialization
            for task in tasks:
                try:
                    # Create TaskResponse object
                    task_response = TaskResponse.model_validate(task)
                    
                    # Test JSON serialization
                    json_data = task_response.model_dump()
                    json_str = json.dumps(json_data, default=str)
                    
                    print(f"✅ Task {task.title}:")
                    
                    # Verify UUID fields are strings
                    uuid_fields = ['id', 'assigned_to', 'assigned_by']
                    for field in uuid_fields:
                        if field in json_data and json_data[field] is not None:
                            if isinstance(json_data[field], str):
                                print(f"   ✅ {field} correctly serialized to string")
                            else:
                                print(f"   ❌ {field} not serialized to string: {type(json_data[field])}")
                                return False
                        
                except Exception as e:
                    print(f"   ❌ Serialization failed for task {task.id}: {e}")
                    return False
            
            print("✅ Tasks endpoint UUID serialization working correctly")
            return True
            
    except Exception as e:
        print(f"❌ Tasks endpoint test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 UUID Serialization Fix Test")
    print("=" * 50)
    
    # Test all endpoints
    users_ok = await test_users_endpoint()
    leads_ok = await test_leads_endpoint()
    tasks_ok = await test_tasks_endpoint()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"👥 Users: {'✅ PASS' if users_ok else '❌ FAIL'}")
    print(f"📊 Leads: {'✅ PASS' if leads_ok else '❌ FAIL'}")
    print(f"✅ Tasks: {'✅ PASS' if tasks_ok else '❌ FAIL'}")
    
    if users_ok and leads_ok and tasks_ok:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ UUID serialization is working correctly")
        print("✅ Your CRM system should now work without validation errors")
        print("\n🚀 Ready to start your CRM server:")
        print("   python start_server.py")
    else:
        print("\n❌ Some tests failed")
        print("Please check the error messages above")

if __name__ == "__main__":
    asyncio.run(main())