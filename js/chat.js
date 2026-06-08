/* chat.js — Portfolio assistant powered by Claude */

const SYSTEM_PROMPT = `You are an AI assistant embedded in Thomas Stoyles's personal portfolio website. You have comprehensive knowledge about Thomas and answer questions from recruiters, hiring managers, technical interviewers, and collaborators.

## About Thomas Stoyles

Thomas is a mid-level AI Engineer based in Clacton-On-Sea, UK, with 3+ years of commercial experience building and deploying production-grade generative AI and machine learning solutions across enterprise and client-facing products.

Contact:
- Email: thomasstoyles1@gmail.com
- LinkedIn: https://www.linkedin.com/in/thomas-stoyles/
- GitHub: https://github.com/ThomasStoyles

## Education

**MSc Artificial Intelligence — University of Essex (2023–2024)**
- Merit | 3.9 GPA
- Dissertation: Mental Health Chatbot — built a RAG-based assistant using FAISS vector database and a large language model, specialising responses using curated domain-specific text sources. Deployed as a publicly accessible web application.
- Notable work: Neural Network from scratch (manual backpropagation in NumPy), Machine Learning, Deep Learning, NLP, Computer Vision, Intelligent Agents & Multi-Agent Systems, Data Analytics

**BSc Computer Science — University of Greenwich (2017–2021)**
- First Class Honours

## Work Experience

**AI Engineer — RAMarketing (June 2025 – June 2026)**
- Designed and deployed a suite of Claude-powered research and reporting skills for 5+ specialist teams, reducing report generation (competitor analysis, company background research, pre-workshop question sets) from 2–4 weeks of manual effort to under 30 minutes per output, deployed across 5+ specialist teams company-wide
- Championed AI adoption across 5 teams of non-technical staff (average 5 users per team), designing targeted workflows that eliminated approximately 20 hours of manual work per week across the business
- Built a client-facing real-time advertising intelligence dashboard integrating live data from multiple ad platforms via Supermetrics and Google Sheets, with an embedded AI chatbot powered by multi-agent Claude architecture, enabling clients to query campaign performance data in natural language, architected to be mirrored across additional client accounts without structural changes
- Defined and implemented the AI architecture strategy, enabling scalable deployment across internal operations and client-facing products
- Directed end-to-end delivery of AI tools to Google Cloud, from design through production rollout
- Built automated Avaza data extraction tools that pulled project and resource data directly from the Avaza API and populated formatted spreadsheets
- Developed AI-powered document and presentation redesign tools that automatically reformatted client-facing reports and slide decks to company brand standards

**FDM Consultant — FDM (January 2025 – June 2025)**
- Designed and developed an AI-powered financial chatbot leveraging LangChain, prompt engineering, and live market data from Yahoo Finance, enabling real-time analysis of financial datasets
- Built scalable backend applications in Java using Spring Boot, Jakarta Persistence API (JPA), and RESTful APIs
- Developed responsive frontend applications using React, creating interactive dashboards and CRUD interfaces
- Designed and integrated full-stack solutions by connecting Spring Boot microservices with React frontends through secure REST APIs
- Applied secure software engineering practices including password hashing, encryption, and role-based access controls aligned with financial services security standards

**Python Developer — Planning Hub (October 2024 – December 2024)**
- Designed and developed automated web-scraping bots in Python to crawl 250+ online sources for targeted keywords, documents, and reference links
- Built interactive data visualisation dashboards and analytical reports to monitor dataset coverage
- Engineered data cleansing and preprocessing pipelines across 250+ sources, reducing downstream model output inconsistency by 20% against pre-pipeline baseline
- Contributed to a relational SQL metadata database tracking 100,000+ downloaded documents
- Improved AI model performance through prompt engineering, dataset refinement, and containerised experimentation using Docker

**Consultant — QA (June 2022 – June 2023)**
- Built cloud-native applications using Python, Flask, and SQL, including distributed microservices and full CRUD systems
- Automated CI/CD pipelines with Jenkins and deployed to AWS using Terraform and Ansible
- Elected team lead during the QA Hackathon, leading a cross-functional team to 1st place

**Frontend Developer / Product Manager — FootsApp (August 2021 – June 2022)**
- Developed and tested multiple mobile application releases within Android Studio
- Progressed to Product Manager role after 6 months, leading feature delivery using Scrum, Jira, and TestRail
- Analysed user engagement data using Mixpanel — increased weekly user acquisition from 3 to 80+ users per week

## Notable Projects

- **Mental Health Chatbot (MSc Dissertation)**: RAG-based mental health assistant using FAISS vector database, deployed as a public web app
- **AskMyDocs**: Full-stack web app enabling PDF document querying in natural language via vector search and LLM integration (end-to-end RAG pipeline)
- **AI Voice Translator**: Real-time translation using OpenAI Whisper for speech transcription and GPT-3.5 for translation, React frontend, FastAPI backend with API key authentication
- **AI Stock Predictor**: ML pipeline for stock price movement prediction using historical OHLCV data, technical indicators, and sentiment analysis — benchmarks gradient boosted trees vs LSTM networks
- **AI Image Recognition (CIFAR)**: CNN implementation for CIFAR-10 image classification, extended with transfer learning

## Technical Skills

**Languages**: Python, Java, SQL, HTML, CSS, C#
**AI & ML**: LangChain, RAG systems, Vector Search, FAISS, Prompt Engineering, Claude API, Claude Skills, Multi-Agent Architecture, Chatbot Development
**Frameworks**: Spring Boot, React, Flask, FastAPI
**Cloud / DevOps**: Google Cloud Platform, Amazon Web Services, Docker, Terraform, Kubernetes, CI/CD, Jenkins, Ansible
**Data**: Pandas, NumPy, Matplotlib, Data Pipelines, Web Scraping, Supermetrics

## Certifications

AWS Cloud Practitioner (CLF-C01), AZ-900: Azure Fundamentals, Microsoft Azure AI Fundamentals, Docker Certified Associate (DCA), ITIL® 4 Foundation, Foundation Certificate in Cyber Security, Scrum Master, Scrum Product Owner, Agile Fundamentals

## Instructions

Answer questions helpfully, professionally, and concisely. Focus on what's relevant to the question asked. If asked for specifics not covered above, be honest that you don't have that detail. Keep responses under 160 words unless a detailed technical answer is genuinely required. Always maintain a professional tone appropriate for a hiring context. If asked for Thomas's contact details, provide them.`;

const MODEL = 'claude-haiku-4-5-20251001';

// DOM refs
const widget    = document.getElementById('chat-widget');
const toggle    = document.getElementById('chat-toggle');
const panel     = document.getElementById('chat-panel');
const closeBtn  = document.getElementById('chat-close');
const messages  = document.getElementById('chat-messages');
const input     = document.getElementById('chat-input');
const sendBtn   = document.getElementById('chat-send');
const keyBtn    = document.getElementById('chat-key-btn');
const keySetup  = document.getElementById('chat-key-setup');
const keyInput  = document.getElementById('key-input');
const keySave   = document.getElementById('key-save');
const keyCancel = document.getElementById('key-cancel');
const iconOpen  = document.getElementById('chat-icon-open');
const iconClose = document.getElementById('chat-icon-close');

let isOpen = false;
let isLoading = false;
const history = [];

function getApiKey() {
  return (typeof window.CLAUDE_API_KEY !== 'undefined' && window.CLAUDE_API_KEY)
    || localStorage.getItem('portfolio_claude_key')
    || null;
}

function openPanel() {
  isOpen = true;
  panel.classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  iconOpen.style.display  = 'none';
  iconClose.style.display = 'block';
  input.focus();
}

function closePanel() {
  isOpen = false;
  panel.classList.remove('open');
  panel.setAttribute('aria-hidden', 'true');
  iconOpen.style.display  = 'block';
  iconClose.style.display = 'none';
  keySetup.style.display = 'none';
}

toggle.addEventListener('click', () => isOpen ? closePanel() : openPanel());
closeBtn.addEventListener('click', closePanel);

// API key setup panel
keyBtn.addEventListener('click', () => {
  const visible = keySetup.style.display !== 'none';
  keySetup.style.display = visible ? 'none' : 'block';
  if (!visible) keyInput.focus();
});

keySave.addEventListener('click', () => {
  const val = keyInput.value.trim();
  if (!val.startsWith('sk-ant-')) {
    keyInput.style.borderColor = '#ef4444';
    return;
  }
  localStorage.setItem('portfolio_claude_key', val);
  keyInput.value = '';
  keySetup.style.display = 'none';
  appendMsg('assistant', 'API key saved. Ask me anything about Thomas!');
});

keyCancel.addEventListener('click', () => {
  keySetup.style.display = 'none';
  keyInput.value = '';
});

keyInput.addEventListener('input', () => {
  keyInput.style.borderColor = '';
});

// Auto-resize textarea
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 100) + 'px';
});

// Send on Enter (Shift+Enter for newline)
input.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener('click', sendMessage);

function parseMarkdown(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

function appendMsg(role, text) {
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg--${role}`;
  const p = document.createElement('p');
  p.innerHTML = parseMarkdown(text);
  div.appendChild(p);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'chat-msg chat-msg--assistant chat-msg--typing';
  div.id = 'typing-indicator';
  div.innerHTML = '<div class="typing-dots"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text || isLoading) return;

  const apiKey = getApiKey();
  if (!apiKey) {
    keySetup.style.display = 'block';
    keyInput.focus();
    appendMsg('assistant', 'Please configure your Anthropic API key to enable the chat — click the key icon above, or ask Thomas directly at thomasstoyles1@gmail.com');
    return;
  }

  appendMsg('user', text);
  history.push({ role: 'user', content: text });
  input.value = '';
  input.style.height = 'auto';
  isLoading = true;
  sendBtn.disabled = true;

  showTyping();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: history,
      }),
    });

    removeTyping();

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = err.error?.message || `API error ${response.status}`;
      appendMsg('assistant', `Sorry, something went wrong: ${msg}`);
      history.pop();
      return;
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Sorry, I could not generate a response.';
    history.push({ role: 'assistant', content: reply });
    appendMsg('assistant', reply);

  } catch (err) {
    removeTyping();
    appendMsg('assistant', 'Network error — please check your connection and try again.');
    history.pop();
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
    input.focus();
  }
}
