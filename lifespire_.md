1. Purpose 

Build a demo healthcare application that enables member-centric document management and AI-assisted clinical insights with increased confidence through multi-LLM consensus validation. 

2. Solution Construct 

Objective 
Demonstrate an AI-assisted healthcare document intelligence application that securely manages member records, ingests documents, and delivers high-confidence clinical insights using multi-modal LLM validation. 

Core Capabilities 

Member-centric document management 

Secure document ingestion and indexing 

Conversational AI over member records 

Healthcare-optimized LLM reasoning 

Multi-model consensus for data accuracy 

Add clinical notes for each member 

2. Goals & Objectives 

Primary Goals 

Demonstrate secure member document ingestion 

Enable conversational AI grounded in member documents 

Increase trust via multi-modal LLM validation 

Success Criteria 

User can retrieve accurate answers from uploaded documents 

Conflicting model outputs are resolved deterministically 

No cross-member data leakage 

 

3. In-Scope Features 

Member creation and search 

Member-scoped document upload 

Incremental document uploads over time 

Conversational AI agent per member 

Healthcare-optimized LLM usage (Azure) 

Multi-LLM consensus validation 

Confidence indication in responses 

Clinical notes for each member 

Generate Member facing report  

 

4. Out of Scope 

EHR integrations 

Clinical decision making or diagnosis. AI strictly retrieves and summarizes information from documents. 

Live member data streams (e.g., vitals, wearables, bedside devices) 

Claims processing, eligibility checks, and reimbursement logics 

Regulatory certification (HIPAA, PHIPA production readiness) 

 

5. User Personas 

Primary User 

Clinician / Care Administrator (Demo) 

Needs 

Quickly review member records 

Ask natural-language questions 

Trust the extracted information 

6. User Journeys 

6.1 Create Member 

User enters minimal demographics 

System generates member ID 

Member is searchable immediately 

6.2 Upload Documents 

User uploads files to a member 

System processes and indexes content 

Documents become queryable 

6.3 AI Interaction 

User asks a question 

System retrieves member documents 

Multiple LLMs extract/answer 

Majority consensus is applied 

Response returned with confidence 

 

7. Functional Requirements 

Member Management 

Create member 

Search member 

View member profile 

Document Management 

Upload PDF, DOCX, image files 

View document list with timestamps 

Support repeated uploads per member 

AI Assistant 

Chat interface per member 

Responses grounded only in member documents 

Cite source documents internally (demo-level) 

LLM Consensus Engine 

Minimum 3 LLM executions per query 

Normalize outputs 

Apply majority-vote logic 

Flag low-confidence cases 

 

8. Non-Functional Requirements 

Security: Member-level data isolation 

Performance: <5 seconds response for typical queries 

Scalability: Support demo-scale usage (≤100 members) 

Reliability: Graceful failure if one LLM fails 

 

9. Technical Requirements (High-Level) 

Frontend: Web-based UI 

Backend: API-based orchestration 

Storage: Blob storage + metadata DB 

AI: 

Azure healthcare-optimized LLM (primary) 

Two additional LLMs for validation 

Retrieval: Vector-based search (RAG) 

Consensus Logic: Backend-owned, deterministic 

 

10. Risks & Mitigations 

Risk 

Mitigation 

Inconsistent LLM outputs 

Majority voting + confidence flag 

Hallucination 

Strict RAG enforcement 

Protected Health Information exposure 

Demo data only, scoped access 

Latency 

Parallel LLM execution 

 

11. Open Questions 

Should low-consensus responses be blocked or flagged? 

Should extracted values be persisted or computed on demand? 

Is clinician override required for demo scenarios? 

 

12. Assumptions 

Demo data only (synthetic or anonymized) 

Single-tenant deployment 

Internal demo users 

 