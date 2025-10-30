# **Project Brief: Kastor Polyglot Suite (Tech Demo Dashboard)**

**Objective:** To build a personal, useful **Proof of Concept (PoC) dashboard** that demonstrates mastery of a modern, polyglot, event-driven architecture. This project serves as a live, interactive demo for the "Member of Technical Staff" role, proving skills in React, Hono/Bun, MongoDB, Python, Go, n8n, LLM orchestration, and **AWS integration**.

### **1\. Core Stack**

* **Frontend:** React (Vite, TypeScript), Tailwind CSS.  
* **API Gateway:** Hono (running on Bun). This is the *only* server the frontend talks to.  
* **Orchestrator 1:** **Windmill** (running on Coolify) for Python & Go scripts.  
* **Orchestrator 2:** **n8n** (running on Coolify) for API/LLM workflows.  
* **Database:** **MongoDB** (running on Coolify).  
* **File Storage:** **AWS S3** (para resultados de scraping e uploads futuros).

### **2\. Architectural Overview**

The **React Frontend** is a simple dashboard with 4 independent modules. All modules send their requests to the **Hono API Gateway**. The Hono API then decides what to do:

1. **Module 1:** Handle the request directly (talks to Mongo).  
2. **Modules 2, 3, 4:** Act as an "event" trigger, forwarding the request to the correct orchestrator (Windmill or n8n) and waiting for a response.

### **3\. Frontend Implementation (React)**

* **App.tsx:** A simple layout (e.g., CSS Grid) that renders 4 main components.  
* **Component 1: CodeSnippets.tsx**  
  * **UI:** A \<form\> with \<input placeholder="Title"\> and \<textarea placeholder="Code Snippet..."\>\</textarea\>. A "Save" button. Below, a \<ul\> that lists saved snippets.  
  * **Logic:** Manages its own state. On load, useEffect fetches from GET /api/snippets. On submit, POSTs to POST /api/snippets.  
* **Component 2: WebScraper.tsx**  
  * **UI:** An \<input placeholder="Paste URL..."\> and a "Scrape Content" button. Shows a "Loading..." spinner. Displays the cleaned text in a \<pre\> tag.  
  * **Logic:** POSTs the URL to POST /api/scrape and displays the returned text.  
* **Component 3: TextSummarizer.tsx**  
  * **UI:** A \<textarea placeholder="Paste text to summarize..."\>\</textarea\> and a "Summarize" button. Shows "Loading..." spinner. Displays the summary.  
  * **Logic:** POSTs the text to POST /api/summarize and displays the returned summary.  
* **Component 4: ProjectMonitor.tsx**  
  * **UI:** A \<textarea placeholder="Paste URLs, one per line..."\>\</textarea\> and a "Check Status" button. Shows "Loading..." spinner. Displays a list of results ({url, status}).  
  * **Logic:** POSTs the block of text to POST /api/monitor and renders the resulting list.

### **4\. Backend Implementation (Hono \+ Orchestrators)**

#### **Module 1: Code Snippets (Hono \-\> Mongo)**

* **GET /api/snippets**  
  * **Logic:** Hono connects *directly* to MongoDB (Coolify). Fetches all snippets. Returns JSON.  
* **POST /api/snippets**  
  * **Logic:** Hono connects *directly* to MongoDB (Coolify). Receives JSON body, inserts new snippet. Returns { success: true }.  
* **Proves:** Fast, simple CRUD with the Bun/Hono/Mongo stack.

#### **Module 2: Web Scraper (Hono \-\> Windmill \+ Python)**

* **POST /api/scrape**  
  * **Logic:** Hono receives the { url }. It makes a *synchronous* fetch call (triggers a webhook) to your **Windmill Python script** (/api/w/run/p/user/scraper\_py), passing the URL. It awaits the response (the cleaned text) and returns it to the React frontend.  
* **Windmill (Python Script): scraper\_py**  
  * **Input:** url (string)  
  * **Logic:**  
    1. Uses requests and beautifulsoup4 libraries to fetch the URL, find the main \<article\> or \<p\> tags, and extract the text.  
    2. **Uses boto3 (AWS SDK for Python) to save the cleaned\_text as a .txt file in a specific AWS S3 bucket.**  
    3. Returns the cleaned\_text to Hono. (O frontend pode opcionalmente receber a URL do S3).  
  * **Output:** cleaned\_text (string)  
* **Proves:** Event-driven architecture, Python orchestration for data processing, **e integração direta com serviços AWS (S3).**

#### **Module 3: Text Summarizer (Hono \-\> n8n \+ LLM)**

* **POST /api/summarize**  
  * **Logic:** Hono receives { text }. It makes a fetch call (triggers a webhook) to your **n8n workflow**. It awaits the response (the summary) and returns it to the React frontend.  
* **n8n (Workflow):**  
  * **Start:** Webhook node (receives text).  
  * **Middle:** Gemini node (or HTTP Request to Gemini API). Prompt: "Summarize this text: {{ $json.text }}".  
  * **End:** Respond to Webhook node (returns the AI summary).  
* **Proves:** LLM integration and API orchestration using n8n (as per your CV).

#### **Module 4: Project Monitor (Hono \-\> Windmill \+ Go)**

* **POST /api/monitor**  
  * **Logic:** Hono receives { urls } (a single string with newlines). It triggers a fetch call to your **Windmill Go script** (/api/w/run/p/user/monitor\_go), passing the string. It awaits the JSON array of results.  
* **Windmill (Go Script): monitor\_go**  
  * **Input:** urls\_string (string)  
  * **Logic:**  
    1. Splits the urls\_string by \\n into a slice.  
    2. Uses sync.WaitGroup and goroutines to make http.Get(url) calls for all URLs *in parallel*.  
    3. Collects results ({url, status}) in a slice.  
  * **Output:** results (JSON array)  
* **Proves:** Go orchestration and understanding of Go's primary benefit (concurrency).