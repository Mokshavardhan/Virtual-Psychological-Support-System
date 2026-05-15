import base64
import zlib
import urllib.request
import os

def create_kroki_url(mermaid_text, output_format='png'):
    compressed = zlib.compress(mermaid_text.encode('utf-8'), 9)
    encoded = base64.urlsafe_b64encode(compressed).decode('utf-8')
    return f"https://kroki.io/mermaid/{output_format}/{encoded}"

diagrams = {
    "Level_0_DFD": """flowchart LR
    User([Student / User]) -- "Login, Chat Messages, Assessment Answers, Journal Entries" --> VPSS((Virtual Psychological Support System))
    VPSS -- "UI Responses, AI Chat Replies, Assessment Results" --> User
    
    VPSS -- "Prompt & Context Request" --> Gemini([Google Gemini API])
    Gemini -- "AI Generated Response" --> VPSS
    
    style VPSS fill:#e2e8f0,stroke:#334155,stroke-width:2px,color:#000000
    style User fill:#bfdbfe,stroke:#2563eb,stroke-width:2px,color:#000000
    style Gemini fill:#fef08a,stroke:#ca8a04,stroke-width:2px,color:#000000""",

    "Level_1_DFD": """flowchart TD
    User([Student / User])
    Gemini([Google Gemini API])
    
    subgraph Processes ["Virtual Psychological Support System"]
        P1((1.0 User Authentication))
        P2((2.0 Chat & Crisis\\nManagement))
        P3((3.0 Assessment Engine))
        P4((4.0 Journaling & Activities))
    end
    
    D1[(D1: Users DB)]
    D2[(D2: Assessments DB)]
    D3[(D3: Journals DB)]
    
    %% Authentication Flow
    User -- "Credentials (Register/Login)" --> P1
    P1 -- "Auth Token / Status" --> User
    P1 -- "User Data" --> D1
    D1 -- "Validation" --> P1
    
    %% Chat Flow
    User -- "Chat Messages" --> P2
    P2 -- "Prompt & Context" --> Gemini
    Gemini -- "AI Response" --> P2
    P2 -- "Chat Replies / Emergency Info" --> User
    
    %% Assessment Flow
    User -- "Questionnaire Answers\\n(PHQ-9, GAD-7)" --> P3
    P3 -- "Assessment Results & Score" --> User
    P3 -- "Store Results" --> D2
    
    %% Journaling Flow
    User -- "Journal Text, Mood Data" --> P4
    P4 -- "Store Entry" --> D3
    D3 -- "Saved Entries" --> P4
    P4 -- "Retrieved Entries" --> User

    style User fill:#bfdbfe,stroke:#2563eb,stroke-width:2px,color:#000000
    style P1 fill:#e2e8f0,stroke:#334155,stroke-width:2px,color:#000000
    style P2 fill:#e2e8f0,stroke:#334155,stroke-width:2px,color:#000000
    style P3 fill:#e2e8f0,stroke:#334155,stroke-width:2px,color:#000000
    style P4 fill:#e2e8f0,stroke:#334155,stroke-width:2px,color:#000000
    style Gemini fill:#fef08a,stroke:#ca8a04,stroke-width:2px,color:#000000
    style D1 fill:#bbf7d0,stroke:#16a34a,stroke-width:2px,color:#000000
    style D2 fill:#bbf7d0,stroke:#16a34a,stroke-width:2px,color:#000000
    style D3 fill:#bbf7d0,stroke:#16a34a,stroke-width:2px,color:#000000""",

    "Level_2_DFD": """flowchart TD
    User([User])
    Gemini([Google Gemini API])
    
    subgraph Process 2.0 ["2.0 Chat & Crisis Management"]
        P2_1((2.1 Receive Chat Message))
        P2_2((2.2 Crisis Detection / Safety Filter))
        P2_3((2.3 LLM Integration Layer))
        P2_4((2.4 Format AI Response))
        P2_5((2.5 Crisis Intervention Protocol))
    end
    
    User -- "Raw User Input" --> P2_1
    P2_1 -- "Sanitized Input" --> P2_2
    
    %% Normal Flow
    P2_2 -- "Safe Status Flagged" --> P2_3
    P2_3 -- "API Request Payload" --> Gemini
    Gemini -- "Standard Chat Data" --> P2_4
    P2_4 -- "Formatted Chat Reply" --> User
    
    %% Crisis Flow
    P2_2 -- "Crisis Status Detected\\n(Harm to self/others)" --> P2_5
    P2_5 -- "Bypass AI, Hardcoded\\nEmergency Contacts" --> User

    style User fill:#bfdbfe,stroke:#2563eb,stroke-width:2px,color:#000000
    style P2_1 fill:#e2e8f0,stroke:#334155,stroke-width:2px,color:#000000
    style P2_2 fill:#fecaca,stroke:#dc2626,stroke-width:2px,color:#000000
    style P2_3 fill:#e2e8f0,stroke:#334155,stroke-width:2px,color:#000000
    style P2_4 fill:#e2e8f0,stroke:#334155,stroke-width:2px,color:#000000
    style P2_5 fill:#fecaca,stroke:#dc2626,stroke-width:2px,color:#000000
    style Gemini fill:#fef08a,stroke:#ca8a04,stroke-width:2px,color:#000000"""
}

out_dir = "/Users/gcdeekshith/Desktop/capstone_project/"
for name, code in diagrams.items():
    url = create_kroki_url(code, 'png')
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    print(f"Downloading {name}.png...")
    try:
        with urllib.request.urlopen(req) as response:
            with open(os.path.join(out_dir, name + ".png"), 'wb') as f:
                f.write(response.read())
        print(f"Successfully saved {name}.png to {out_dir}")
    except Exception as e:
        print(f"Error fetching {name}.png: {e}")
