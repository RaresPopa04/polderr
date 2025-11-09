"""
Reports API endpoints - Generate and export reports as PDF
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from datetime import datetime
import os
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, ListFlowable, ListItem
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
import re
import markdown2

from database import db

router = APIRouter()

# Create reports directory if it doesn't exist
REPORTS_DIR = "generated_reports"
os.makedirs(REPORTS_DIR, exist_ok=True)

def generate_pdf(content: str, title: str, filename: str) -> str:
    """Generate a PDF from markdown-formatted content"""
    filepath = os.path.join(REPORTS_DIR, filename)
    
    # Create PDF document
    doc = SimpleDocTemplate(filepath, pagesize=A4)
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor='#1a1a1a',
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    h1_style = ParagraphStyle(
        'CustomH1',
        parent=styles['Heading1'],
        fontSize=18,
        textColor='#2c3e50',
        spaceAfter=12,
        spaceBefore=16,
        alignment=TA_LEFT
    )
    
    h2_style = ParagraphStyle(
        'CustomH2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor='#34495e',
        spaceAfter=10,
        spaceBefore=12,
        alignment=TA_LEFT
    )
    
    h3_style = ParagraphStyle(
        'CustomH3',
        parent=styles['Heading3'],
        fontSize=12,
        textColor='#34495e',
        spaceAfter=8,
        spaceBefore=10,
        alignment=TA_LEFT
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=10,
        leading=14,
        spaceAfter=8,
        alignment=TA_JUSTIFY
    )
    
    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=styles['BodyText'],
        fontSize=10,
        leading=14,
        leftIndent=20,
        spaceAfter=6,
    )
    
    # Add title
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 0.2 * inch))
    
    # Add timestamp
    timestamp_text = f"Generated on: {datetime.now().strftime('%B %d, %Y at %H:%M')}"
    story.append(Paragraph(timestamp_text, styles['Normal']))
    story.append(Spacer(1, 0.3 * inch))
    
    # Parse markdown and add content
    lines = content.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        if not line:
            story.append(Spacer(1, 0.1 * inch))
            i += 1
            continue
        
        # Handle headers
        if line.startswith('# '):
            text = line[2:].strip()
            story.append(Paragraph(text, h1_style))
        elif line.startswith('## '):
            text = line[3:].strip()
            story.append(Paragraph(text, h2_style))
        elif line.startswith('### '):
            text = line[4:].strip()
            story.append(Paragraph(text, h3_style))
        
        # Handle bullet points
        elif line.startswith('- ') or line.startswith('* '):
            text = line[2:].strip()
            # Format bold and italic
            text = format_inline_markdown(text)
            story.append(Paragraph(f"• {text}", bullet_style))
        
        # Handle numbered lists
        elif re.match(r'^\d+\.\s', line):
            text = re.sub(r'^\d+\.\s', '', line).strip()
            text = format_inline_markdown(text)
            number = re.match(r'^(\d+)\.', line).group(1)
            story.append(Paragraph(f"{number}. {text}", bullet_style))
        
        # Handle bold section headers (lines that are all bold)
        elif line.startswith('**') and line.endswith('**'):
            text = line[2:-2].strip()
            story.append(Paragraph(f"<b>{text}</b>", h3_style))
        
        # Regular paragraph
        else:
            text = format_inline_markdown(line)
            story.append(Paragraph(text, body_style))
        
        i += 1
    
    # Build PDF
    doc.build(story)
    return filepath

def format_inline_markdown(text: str) -> str:
    """Format inline markdown (bold, italic, links) to HTML for ReportLab"""
    # Links first (before escaping) - [text](url) -> <a href="url" color="blue">text</a>
    text = re.sub(r'\[([^\]]+)\]\(([^\)]+)\)', r'<a href="\2" color="blue"><u>\1</u></a>', text)
    
    # Escape HTML special characters (but preserve our <a> tags)
    # We need to be careful here - let's use a placeholder approach
    links = []
    def save_link(match):
        links.append(match.group(0))
        return f"___LINK_{len(links)-1}___"
    
    # Save links
    text = re.sub(r'<a href="[^"]*"[^>]*>.*?</a>', save_link, text)
    
    # Now escape special characters
    text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    
    # Restore links
    for i, link in enumerate(links):
        text = text.replace(f"___LINK_{i}___", link)
    
    # Bold: **text** or __text__ -> <b>text</b>
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'__(.+?)__', r'<b>\1</b>', text)
    
    # Italic: *text* or _text_ -> <i>text</i>
    text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
    text = re.sub(r'_(.+?)_', r'<i>\1</i>', text)
    
    # Code: `text` -> monospace
    text = re.sub(r'`(.+?)`', r'<font name="Courier">\1</font>', text)
    
    return text

@router.get("/reports/topic/{topic_id}/pdf")
async def export_topic_report_pdf(topic_id: int):
    """
    Generate and download a PDF report for a specific topic
    """
    
    # Get topic data
    topic = db.get_topic_by_id(topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Generate report text using existing method
    report_content = db.get_raport_for_topic(topic_id)
    if not report_content:
        raise HTTPException(status_code=500, detail="Failed to generate report")
    
    # Generate PDF
    filename = f"topic_{topic_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    title = f"Report: {topic.name}"
    
    try:
        filepath = generate_pdf(report_content, title, filename)
        return FileResponse(
            filepath,
            media_type='application/pdf',
            filename=filename
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

@router.get("/reports/event/{event_id}/pdf")
async def export_event_report_pdf(event_id: int):
    """
    Generate and download a PDF report for a specific event
    """
    
    # Get event data
    event = db.get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Generate report text using existing method
    report_content = db.get_raport_for_event(event_id)
    if not report_content:
        raise HTTPException(status_code=500, detail="Failed to generate report")
    
    # Generate PDF
    filename = f"event_{event_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    title = f"Event Report: {event.name}"
    
    try:
        filepath = generate_pdf(report_content, title, filename)
        return FileResponse(
            filepath,
            media_type='application/pdf',
            filename=filename
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

@router.get("/reports/weekly/pdf")
async def export_weekly_report_pdf():
    """
    Generate and download a PDF report for the last week
    """
    
    # Generate report text
    report_content = db.get_raport_for_last_week()
    if not report_content:
        raise HTTPException(status_code=500, detail="Failed to generate report")
    
    # Generate PDF
    filename = f"weekly_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    title = "Weekly Report"
    
    try:
        filepath = generate_pdf(report_content, title, filename)
        return FileResponse(
            filepath,
            media_type='application/pdf',
            filename=filename
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

@router.get("/reports/monthly/pdf")
async def export_monthly_report_pdf():
    """
    Generate and download a PDF report for the last month
    """
    
    # Generate report text
    report_content = db.get_raport_for_last_month()
    if not report_content:
        raise HTTPException(status_code=500, detail="Failed to generate report")
    
    # Generate PDF
    filename = f"monthly_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    title = "Monthly Report"
    
    try:
        filepath = generate_pdf(report_content, title, filename)
        return FileResponse(
            filepath,
            media_type='application/pdf',
            filename=filename
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

