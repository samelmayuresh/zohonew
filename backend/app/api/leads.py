from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.utils.database import get_db
from app.utils.mock_database import get_mock_db
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadResponse, LeadUpdate
from typing import List

router = APIRouter()

@router.post("/", response_model=LeadResponse)
async def create_lead(lead_data: LeadCreate, request: Request, db: AsyncSession = Depends(get_db)):
    """Create a new lead"""
    use_real_db = getattr(request.app.state, 'use_real_db', False)
    
    if use_real_db:
        # Real database logic
        new_lead = Lead(
            first_name=lead_data.first_name,
            last_name=lead_data.last_name,
            email=lead_data.email,
            phone=lead_data.phone,
            company=lead_data.company,
            source=lead_data.source,
            status=lead_data.status or "new",
            assigned_to=lead_data.assigned_to,
            created_by=lead_data.created_by
        )
        
        db.add(new_lead)
        await db.commit()
        await db.refresh(new_lead)
        
        return LeadResponse(
            id=str(new_lead.id),
            first_name=new_lead.first_name,
            last_name=new_lead.last_name,
            email=new_lead.email,
            phone=new_lead.phone,
            company=new_lead.company,
            source=new_lead.source,
            status=new_lead.status,
            assigned_to=str(new_lead.assigned_to) if new_lead.assigned_to else None,
            created_by=str(new_lead.created_by),
            created_at=new_lead.created_at,
            updated_at=new_lead.updated_at
        )
    else:
        # Mock database logic
        mock_db = await get_mock_db()
        lead_dict = {
            "first_name": lead_data.first_name,
            "last_name": lead_data.last_name,
            "email": lead_data.email,
            "phone": lead_data.phone,
            "company": lead_data.company,
            "source": lead_data.source,
            "status": lead_data.status or "new",
            "assigned_to": lead_data.assigned_to,
            "created_by": lead_data.created_by
        }
        
        new_lead = await mock_db.create_lead(lead_dict)
        return LeadResponse(**new_lead)

@router.get("/", response_model=List[LeadResponse])
async def get_leads(request: Request, db: AsyncSession = Depends(get_db)):
    """Get all leads"""
    use_real_db = getattr(request.app.state, 'use_real_db', False)
    
    if use_real_db:
        result = await db.execute(select(Lead))
        leads = result.scalars().all()
        return [LeadResponse(
            id=str(lead.id),
            first_name=lead.first_name,
            last_name=lead.last_name,
            email=lead.email,
            phone=lead.phone,
            company=lead.company,
            source=lead.source,
            status=lead.status,
            assigned_to=str(lead.assigned_to) if lead.assigned_to else None,
            created_by=str(lead.created_by),
            created_at=lead.created_at,
            updated_at=lead.updated_at
        ) for lead in leads]
    else:
        mock_db = await get_mock_db()
        leads = await mock_db.get_all_leads()
        return [LeadResponse(**lead) for lead in leads]

@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(lead_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Get lead by ID"""
    use_real_db = getattr(request.app.state, 'use_real_db', False)
    
    if use_real_db:
        result = await db.execute(select(Lead).where(Lead.id == lead_id))
        lead = result.scalar_one_or_none()
        
        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found"
            )
        
        return LeadResponse(
            id=str(lead.id),
            first_name=lead.first_name,
            last_name=lead.last_name,
            email=lead.email,
            phone=lead.phone,
            company=lead.company,
            source=lead.source,
            status=lead.status,
            assigned_to=str(lead.assigned_to) if lead.assigned_to else None,
            created_by=str(lead.created_by),
            created_at=lead.created_at,
            updated_at=lead.updated_at
        )
    else:
        mock_db = await get_mock_db()
        lead = await mock_db.get_lead_by_id(lead_id)
        
        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found"
            )
        
        return LeadResponse(**lead)