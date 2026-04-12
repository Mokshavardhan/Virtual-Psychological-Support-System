
# 🧠 VIRTUAL PSYCHOLOGICAL SUPPORT SYSTEM — BACKEND


project:
  title: "🧠 Virtual Psychological Support System"
  subtitle: "AI-Driven Backend for Student Mental Well-Being"
  type: "Backend System"
  focus: "Ethical AI • Mental Health • Crisis Safety"
  description: >
    A privacy-first, AI-powered backend system designed to support student
    mental well-being through natural language interaction, standardized
    psychological self-assessments, and responsible crisis intervention.
    The system emphasizes ethical AI behavior, user safety, and scalability.


# 🎯 OBJECTIVES


objectives:
  - 💬 Enable empathetic AI-based mental health conversations
  - 🧪 Integrate clinically recognized psychological questionnaires
  - 🚨 Detect crisis situations and respond safely without AI hallucination
  - 🔒 Preserve user privacy and data confidentiality
  - 🧩 Provide a modular backend suitable for real-world deployment


# ⭐ KEY FEATURES


key_features:
  conversational_ai:
    - Natural language chat powered by Google Gemini
    - Trauma-informed, supportive tone
    - Short, clear, student-friendly responses

  assessments:
    standardized_tools:
      - PHQ-9 → Depression screening
      - GAD-7 → Anxiety screening
      - PSS-10 → Perceived stress measurement
      - CBI → Burnout assessment

  crisis_handling:
    - 🚨 Self-harm detection
    - 🚨 Harm-to-others detection
    - ⛔ AI completely bypassed during crisis
    - 📞 Emergency helplines and support resources provided

  intelligence:
    - Severity-based response logic
    - Personalized guidance based on assessment scores

  privacy:
    - 🔐 No conversation storage
    - 🔐 No personal identifiers
    - 🔐 Anonymous in-memory analytics only


# 🏗️ BACKEND ARCHITECTURE


backend_architecture:
  root: src/
  structure:
    app_js: "Express app setup, middleware, and routing"
    server_js: "Server bootstrap and listener"

    routes:
      chat_js: >
        Central API endpoint handling:
        chat flow, crisis detection, assessment initiation,
        and AI orchestration.

    services:
      llm_js: "Google Gemini AI integration layer"
      prompts_js: "Prompt engineering and system instructions"
      safety_js: "Risk analysis and crisis classification"
      crisisResponse_js: "Hard-coded, safe crisis responses"
      assessments_js: "Questionnaire loader and dispatcher"
      scoring_js: "Assessment scoring and severity interpretation"

    data:
      phq9_json: "PHQ-9 questionnaire data"
      gad7_json: "GAD-7 questionnaire data"
      pss10_json: "PSS-10 questionnaire data"
      cbi_burnout_json: "Burnout questionnaire data"


# ⚙️ TECHNOLOGY STACK


tech_stack:
  runtime: "Node.js"
  framework: "Express.js"
  ai_model: "Google Gemini"
  validation: "Zod"
  logging: "Morgan (privacy-safe)"
  data_format: "JSON"
  environment_management: ".env (excluded from GitHub)"
  version_control: "Git & GitHub"


# 🔄 SYSTEM WORKFLOW


system_flow:
  - 🧑 User sends a message to the `/chat` endpoint
  - 🔍 Backend analyzes input for risk signals
  - 🚨 If crisis detected:
      - AI generation is stopped immediately
      - A predefined, safe response is returned
      - Emergency contact information is included
  - 💬 If no crisis:
      - AI responds empathetically
      - User may be prompted to take an assessment
  - 🧪 Assessment answers are scored on the backend
  - 🧠 AI tailors responses based on severity level

################################################################################
# 🚨 ETHICAL AI & SAFETY DESIGN
################################################################################

ethical_ai_principles:
  - AI never handles crisis conversations directly
  - Crisis logic is strictly backend-controlled
  - No diagnosis or medical advice is provided
  - Language remains non-judgmental and supportive
  - User safety always overrides AI output

################################################################################
# 🔐 PRIVACY & SECURITY
################################################################################

privacy_and_security:
  data_handling:
    - No database storage of conversations
    - No personally identifiable information collected
  logging_policy:
    - No request body logging
    - Minimal metadata only
  repository_safety:
    - `.env` excluded via `.gitignore`
    - API keys never committed

################################################################################
# 🔌 API ENDPOINTS
################################################################################

api_endpoints:
  health:
    method: GET
    path: /health
    response: "{ ok: true }"

  chat:
    normal_chat:
      method: POST
      path: /chat
      payload_example:
        text: "I feel stressed because of exams"

    start_assessment:
      method: POST
      path: /chat
      payload_example:
        action: start_assessment
        type: pss10

    submit_assessment:
      method: POST
      path: /chat
      payload_example:
        action: submit_assessment
        type: pss10
        answers:
          q1: 3
          q2: 2
          q3: 4

################################################################################
# 🎓 ACADEMIC & EXPO VALUE
################################################################################

academic_relevance:
  demonstrates:
    - Responsible AI deployment
    - Mental health domain understanding
    - Backend system engineering
    - Ethical crisis intervention
    - Scalable and modular design
  suitable_for:
    - College expos
    - Capstone projects
    - Research demos
    - AI ethics discussions

################################################################################
# 🔮 FUTURE SCOPE
################################################################################

future_scope:
  - JWT-based authentication
  - Persistent assessment history
  - Frontend dashboards
  - Therapist and counselor integration
  - Multilingual support
  - Follow-up monitoring and alerts

################################################################################
# 👨‍💻 AUTHOR
################################################################################

author:
  name: "Mokshavardhan"
  role: "Backend & AI Integration "
  degree: "B.Tech Computer Science Engineering"
  github: "https://github.com/Mokshavardhan"

################################################################################
# ⚠️ DISCLAIMER
################################################################################

disclaimer: >
  This system is not a substitute for professional mental health care.
  It is intended solely as a supportive, educational, and research-oriented tool.
