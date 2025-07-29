# Design Document

## Overview

The CRM system is experiencing UUID serialization errors when connected to the real Supabase database. The root cause is a mismatch between the database models (which use UUID objects) and the Pydantic schemas (which expect string representations). This design addresses the issue by implementing proper UUID handling in Pydantic schemas and ensuring consistent serialization across all API endpoints.

## Architecture

### Current Problem
- Database models use `UUID(as_uuid=True)` which returns Python UUID objects
- Pydantic schemas define UUID fields as `str` type
- FastAPI validation fails when trying to serialize UUID objects as strings
- Error: `Input should be a valid string` when UUID object is returned

### Solution Architecture
- Update Pydantic schemas to use proper UUID field types with custom serialization
- Implement UUID field configuration that accepts both UUID objects and strings
- Add custom serializers to convert UUID objects to strings in responses
- Ensure backward compatibility with existing string-based UUID handling

## Components and Interfaces

### 1. Enhanced Pydantic Schemas

**UUID Field Configuration:**
```python
from pydantic import BaseModel, Field
from uuid import UUID
from typing import Union

# Custom UUID field that accepts UUID objects and serializes to strings
UUIDField = Field(
    ..., 
    description="UUID field that accepts UUID objects and strings",
    json_schema_extra={"type": "string", "format": "uuid"}
)
```

**Schema Updates:**
- `UserResponse`: Update `id` field to handle UUID objects
- `LeadResponse`: Update `id`, `assigned_to`, `created_by` fields
- `TaskResponse`: Update `id`, `assigned_to`, `assigned_by` fields

### 2. Custom Field Validators

**UUID Serialization:**
```python
from pydantic import field_serializer
from uuid import UUID

class BaseResponseModel(BaseModel):
    @field_serializer('id', 'assigned_to', 'created_by', 'assigned_by', when_used='json')
    def serialize_uuid(self, value):
        if isinstance(value, UUID):
            return str(value)
        return value
```

### 3. Model Configuration

**Pydantic Config Updates:**
```python
class Config:
    from_attributes = True
    json_encoders = {
        UUID: str  # Automatically convert UUID objects to strings
    }
    arbitrary_types_allowed = True
```

## Data Models

### Updated Schema Structure

**UserResponse Schema:**
```python
class UserResponse(BaseModel):
    id: Union[str, UUID]
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    @field_serializer('id')
    def serialize_id(self, value):
        return str(value) if isinstance(value, UUID) else value
    
    class Config:
        from_attributes = True
        json_encoders = {UUID: str}
```

**LeadResponse Schema:**
```python
class LeadResponse(BaseModel):
    id: Union[str, UUID]
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = None
    status: str
    assigned_to: Optional[Union[str, UUID]] = None
    created_by: Union[str, UUID]
    created_at: datetime
    updated_at: datetime
    
    @field_serializer('id', 'assigned_to', 'created_by')
    def serialize_uuids(self, value):
        return str(value) if isinstance(value, UUID) else value
    
    class Config:
        from_attributes = True
        json_encoders = {UUID: str}
```

**TaskResponse Schema:**
```python
class TaskResponse(BaseModel):
    id: Union[str, UUID]
    title: str
    description: Optional[str] = None
    assigned_to: Union[str, UUID]
    assigned_by: Union[str, UUID]
    status: str
    priority: str
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    @field_serializer('id', 'assigned_to', 'assigned_by')
    def serialize_uuids(self, value):
        return str(value) if isinstance(value, UUID) else value
    
    class Config:
        from_attributes = True
        json_encoders = {UUID: str}
```

## Error Handling

### Validation Error Prevention
- Use `Union[str, UUID]` types to accept both formats
- Implement custom serializers for consistent output
- Add error handling for malformed UUID strings
- Provide clear error messages for UUID validation failures

### Backward Compatibility
- Maintain support for string-based UUID inputs
- Ensure existing API consumers continue to work
- Gradual migration path for any hardcoded UUID handling

## Testing Strategy

### Unit Tests
- Test UUID object to string serialization
- Test string UUID to object conversion
- Test mixed UUID format handling
- Test error cases with invalid UUIDs

### Integration Tests
- Test all API endpoints with real database
- Verify consistent UUID serialization across endpoints
- Test create/read/update operations with UUIDs
- Validate frontend compatibility

### API Response Tests
- Verify all responses return string UUIDs
- Test JSON serialization consistency
- Validate OpenAPI schema generation
- Check FastAPI documentation accuracy

## Implementation Approach

### Phase 1: Schema Updates
1. Create base response model with UUID serialization
2. Update UserResponse schema with UUID handling
3. Update LeadResponse schema with UUID handling
4. Update TaskResponse schema with UUID handling

### Phase 2: API Endpoint Testing
1. Test users endpoints with real database
2. Test leads endpoints with real database
3. Test tasks endpoints with real database
4. Verify all endpoints return consistent data types

### Phase 3: Validation and Cleanup
1. Run comprehensive API tests
2. Verify frontend compatibility
3. Update API documentation
4. Clean up any remaining UUID handling issues

## Performance Considerations

### Serialization Performance
- UUID to string conversion is lightweight
- Minimal impact on API response times
- Pydantic serialization is optimized for common types

### Memory Usage
- No significant memory overhead
- UUID objects and strings have similar memory footprint
- Efficient serialization without data duplication

## Security Implications

### UUID Exposure
- UUIDs are safe to expose in API responses
- No sensitive information revealed through UUID format
- Consistent UUID format prevents information leakage

### Validation Security
- Proper UUID validation prevents injection attacks
- Type safety ensures data integrity
- Error handling prevents information disclosure