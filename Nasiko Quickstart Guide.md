# **Nasiko Quickstart Guide**  **Prerequisites**

* Docker & Docker Compose  
* Python 3.12 version only  
* 4GB+ RAM recommended  
* It only supports latest  from windows 10/11

## **Step 1 — Clone the Repository ([Nasiko Labs](https://github.com/Nasiko-Labs/nasiko))**

Download the Nasiko project to your machine.  
1\. Run: git clone https://github.com/Nasiko-Labs/nasiko.git  
2\. Run: cd nasiko

## **Step 2 — Create Environment Configuration**

Create the local environment file.  
1\. Run: cp .nasiko-local.env.example .nasiko-local.env  
**Note: Open .nasiko-local.env and add your API keys.**

Example:  
1\. USER\_CREDENTIALS\_ENCRYPTION\_KEY=your-secure-key  
2\. OPENAI\_API\_KEY=your-api-key

## **Step 3 — Install Dependencies**

Install the required dependencies.  
1\. Run: pip install uv  
2\. Run: uv sync

## **Step 4 — Start Nasiko**

Start all services using Docker Compose.   
1\. Run: docker compose \-f docker-compose.local.yml \--env-file .nasiko-local.env up \-d

## **Step 5 — Open the Dashboard**

Open Nasiko in your browser. http://localhost:9100/app/

## **Step 6 — Verify Installation**

Run: docker compose \-f docker-compose.local.yml \--env-file .nasiko-local.env ps

1\. Test Backend API: curl http://localhost:8000/api/v1/healthcheck  
2\. Test Kong Gateway: curl http://localhost:9100/health

## **Setup Complete 🚀**

Nasiko is now running locally on your system.

**Let’s Deploy Our First Agent**

## **Step 1 — Find Your Login Credentials**

1. Run:  cat orchestrator/superuser\_credentials.json  
   Output:  
   You’ll see credentials like:  
   {  
     "email": "admin@example.com",  
     "username": "admin",  
     "access\_key": "your-access-key-here",  
     "access\_secret": "your-access-secret-here"  
   }

## **Step 2 — Sign In to Nasiko**

2. Open: http://localhost:9100/app/  
   Use the Access Key and Access Secret from the credentials file and click Sign In.

## **Step 3 — Deploy Your First Agent**

1\. Open the sidebar  
2\. Click Add Agent  
3\. Select Upload ZIP  
4\. Choose agents/a2a-translator.zip  
5\. Click Upload

## **Step 4 — Wait for Deployment**

Statuses:  
\- Setting Up → Container build started  
\- Active → Agent ready  
\- Failed → Deployment issue

Local deployment usually takes 1–2 minutes.

## **Step 5 — Verify the Agent**

Run: curl http://localhost:9100/agents/translator/health

##   **Step 6 — Start a Session**

From the Home Dashboard, click Start Session on the Translator Agent card.

## **Step 7 — Test the Agent**

Try these Prompts:  
1\. Translate "Hello, how are you?" to French  
2\.  Convert this text to Spanish: "The weather is beautiful today"  
3\.  Translate the following to German: "Thank you for your help"

## **Step 8 — Test the Router**

Run: curl "http://localhost:9100/router/route?query=translate this to French"

## **Next Steps**

\> Deploy more agents  
\> Explore Phoenix observability  
\> Build your own agent  
\> Set up the Nasiko CLI

C**ontributing to Nasiko Open Source**

After solving and building the solution:

1. **Fork the repository from GitHub**  
2. **Clone your fork to your local system**  
3. **Create a new branch for your changes**  
4. **Commit and push your solution to your fork**  
5. **Raise a PR to the main repository**

* [Nasiko GitHub Repository](https://github.com/Nasiko-Labs/nasiko?utm_source=chatgpt.com) **(Star for giveaways⭐)**

* [**Nasiko Early Adopters**](https://forms.gle/d7WMu4Rp8DRbHZG59) **(Join Us Now)**

