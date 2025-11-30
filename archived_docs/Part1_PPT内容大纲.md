# Part 1: Tu2tor项目PPT演示文稿

## 📊 PPT结构概览

**项目名称:** Tu2tor - Campus Peer Tutoring Platform
**总页数:** 18-22页
**演示时长:** 10-15分钟
**命名格式:** `你的姓名_学号_班级_Part1.pptx`

---

## 📝 Problem Definition/Customer Needs (Written Documentation)

### Understanding the Scenario

The Tu2tor platform addresses the challenge of accessing quality peer-to-peer academic support at Temasek Polytechnic. Currently, students rely on informal methods such as WhatsApp groups, friend recommendations, and bulletin boards to find tutors. This creates information asymmetry where students cannot systematically discover peers with the right expertise and availability. The scenario involves three stakeholder groups: students seeking help (tutees), student tutors offering their knowledge, and school administration fostering collaborative learning. Students aim to find qualified tutors before critical deadlines, while tutors seek to showcase expertise, manage schedules efficiently, and build reputation while earning credits.

### Key Problems and Pain Points

**Problem #1: Discovery Problem - Information Silos Prevent Finding Qualified Tutors.** In the discovery stage, students cannot systematically find qualified peer tutors because communication happens organically through existing social circles (class groups, friends, casual networks) rather than through purposeful channels designed for academic support. Research shows that **peer tutoring has a significant positive effect size of g = 0.480 on college students' academic performance** [Source: https://link.springer.com/article/10.1007/s40299-024-00960-0], yet this resource remains severely underutilized due to discovery barriers. When struggling with DBAV, students are limited to asking classmates within their immediate network, missing out on highly qualified tutors from other classes or cohorts who have proven expertise in that subject. While informal channels like WhatsApp have high engagement rates (98% open rate) [Source: https://sleekflow.io/blog/whatsapp-education], they limit discovery to existing social networks. Students rely primarily on friend recommendations to find study help, creating information silos where talented tutors remain invisible simply because they're not in the same social circle. There is no way to search for tutors by subject expertise, availability, or past performance. Students waste valuable time asking around with no guarantee of finding suitable help. Customer need: *"As a student struggling with DBAV, I want to quickly find experienced tutors available this week with good ratings, so that I can get help before my exam."*

**Problem #2: Coordination Problem - Informal Channels Make Booking and Management Chaotic.** Once a student finds a potential tutor, the coordination stage becomes problematic due to reliance on informal channels like WhatsApp or personal messaging. Data shows that **60% of institutions observed that online classes tend to fill first in 2024** [Source: https://research.com/education/online-education-statistics], indicating strong student preference for digital, centralized solutions over informal coordination. Research identifies major coordination challenges with WhatsApp-based tutoring including **information overload in large group chats, 24/7 availability expectations, and messages getting lost in the noise** [Source: https://www.mdpi.com/2071-1050/14/19/12304]. Without a unified platform, students and tutors must manually coordinate schedules through back-and-forth messages, leading to missed appointments, double-booking, and confusion about session details. There is no centralized booking system, no calendar integration, and no systematic way to track upcoming or past sessions. Each tutoring arrangement requires separate, manual coordination across different communication tools. This fragmented approach creates unnecessary friction in what should be a seamless process from booking confirmation to session completion. Customer need: *"As a tutor managing 5-10 sessions per week, I want a centralized booking system with automatic conflict detection and calendar integration, so that I can efficiently manage my tutoring schedule without chaotic messaging."*

**Problem #3: Trust & Motivation Problem - No Quality Assurance and No Incentive for Good Students to Help.** The current peer learning environment suffers from two critical interconnected issues. First, there is no quality assurance mechanism - students have no access to reviews, ratings, or performance history when seeking tutors, making it impossible to assess the quality of help they will receive before committing time and effort. Students commonly express significant concerns about tutor quality before engaging in peer tutoring, with many having had negative experiences with unqualified peer tutors. Second, and more fundamentally, good students often lack motivation to help their peers without structured incentive systems. Research demonstrates that **incentive reward systems (including credit-based compensation and gamification) notably enhance student engagement and participation**, with external rewards complementing intrinsic motivation [Source: https://www.nature.com/articles/s41599-025-04860-6]. Without meaningful rewards, capable students view tutoring as a time-consuming favor rather than a mutually beneficial exchange. Tu2tor solves this through a credit-based economy where helping others directly benefits one's future self - students earn credits by tutoring, which they can use when they need help in other subjects. This innovative approach means when students help their peers today, they are essentially helping their future selves, creating a sustainable and self-reinforcing peer learning ecosystem. Customer need: *"As a high-performing student, I want to earn credits for helping my peers, so that when I need help in areas where I'm weak, I can access quality tutoring - essentially investing in my future self by helping others now."*

**Problem #4: Matching Problem - Manual Browsing Without AI-Driven Recommendations.** Students must manually browse dozens of tutor profiles, leading to decision fatigue and inefficiency. Without intelligent matching based on learning history, they struggle to identify the best fit for their needs. Customer need: *"As a student with previous ADEV tutoring, I want AI recommendations based on my history, so that I can quickly find the best match."*

### Acceptance Criteria

From these user stories and problem definitions, we know Tu2tor succeeds when:

**Finding Qualified Tutors Quickly:**
- Students can search by subject, rating, and availability without asking around in multiple group chats
- Search results surface tutors beyond students' immediate social circles
- Students feel confident they've found the right help before exam deadlines

**Making Informed Decisions:**
- Students can read authentic reviews from peers who've worked with the tutor
- Review content helps students assess whether the tutor is clear, patient, and knowledgeable
- Students trust they're spending credits wisely on quality tutoring

**Seamless Session Experience:**
- Students join video sessions with one click, no copying Zoom links or downloading apps
- Tutors can manage their schedule through centralized calendar without WhatsApp chaos
- Both parties can multitask with floating video while browsing the platform

**Credit System Motivation:**
- Strong students see tutoring as "helping their future self" rather than just a favor
- Students who excel in one subject earn credits to get help in subjects they struggle with
- The ecosystem sustains itself through mutual benefit rather than relying on altruism

**AI-Powered Personalization:**
- Students receive tutor recommendations based on their learning history
- The platform remembers past subjects studied and suggests appropriate next steps
- Browsing time decreases significantly compared to manually scrolling through profiles

**Building Tutor Reputation:**
- Tutors can showcase their expertise through verified reviews and session counts
- Tutor profiles serve as credible evidence for resumes and job applications
- Students prefer tutors with documented track records over unknown peers

**Real-Time Collaborative Learning:**
- Programming tutoring sessions include live code editing where both can type simultaneously
- Students learn by doing alongside tutors, not just watching explanations
- Code collaboration makes debugging and understanding concepts more effective

These criteria ensure Tu2tor addresses real user needs rather than just adding features.

---

## 📋 User Stories

### Student (Tutee) Perspective

**Finding Qualified Tutors Quickly**
> I'm a Year 1 IT student struggling with DBAV, and my exam is next week. I need to find a tutor who really knows this subject and has helped other students successfully before. I don't have time to ask around in multiple WhatsApp groups or wait for responses. I want a system where I can search by subject, see who's available this week, and check their ratings from previous students. This would make the website personalised to me and help me get the right help before it's too late.

**Making Informed Decisions with Reviews**
> I want to book a tutor for React.js, but I'm worried about wasting my credits on someone who might not be helpful. Before I commit, I need to see what other students have said about this tutor. Were they clear in their explanations? Did they actually help improve grades? I feel that students should have transparency about tutor quality through a review system, so I can make confident decisions about who to learn from.

**Seamless Video Sessions**
> When I book an online tutoring session, I don't want to deal with multiple apps and lost Zoom links. Planning would be easier if the video meeting was integrated right into the platform. I should be able to click "Join Session" and immediately start learning without copying links, downloading apps, or troubleshooting technical issues. The system should remember my upcoming sessions and let me join with one click.

**Personalized AI Recommendations**
> I've already taken tutoring for ADEV and JavaScript, and now I need help with React. The modules I want to learn need not be confined to what I'm currently studying—perhaps I would like to explore other IT frameworks or even design principles. I want an authentication system so that the platform remembers my learning history and recommends tutors who match my progression. Instead of browsing hundreds of profiles, the AI should suggest the best tutors based on what I've learned before.

**Real-time Collaborative Coding During Sessions**
> When I need help with programming assignments, talking through problems on video isn't enough. I want a built-in code editor where my tutor and I can type simultaneously. When they explain recursion, they write example code, and I modify it immediately to test my understanding. We debug together, run code to see results, and iterate quickly. This hands-on, collaborative coding makes learning much more effective than just watching—I learn by doing alongside an expert.

### Tutor Perspective

**Credit System - Helping Others Means Helping My Future Self**
> I'm strong in DBAV but struggle with ADEV. I've never been motivated to tutor because it takes time from my studies. With Tu2tor's credit system, when I tutor DBAV now, I earn credits to use for ADEV help next semester. Helping my peers today is actually investing in my own future learning. This makes me want to actively share my knowledge, knowing that when I need help later, I'll have credits to access quality tutoring. It's helping others while helping my future self.

**Managing My Tutoring Schedule**
> I'm helping 3 students every week, and I want to make it easy for potential students to know when I'm available without constant messaging. I should be able to set my available time slots once in my profile—for example, Mondays 2-5pm and Wednesdays 10am-4pm—and students can view these slots directly when they visit my profile. When a student books a slot, the system should automatically mark it as unavailable for others, preventing double-booking. This way, I don't have to manually coordinate schedules through WhatsApp, and students can immediately see when they can book me.

**Building My Reputation**
> I specialize in web development subjects like ADEV and DBAV and I've helped many students improve their grades. When I apply for internships or jobs, I want to include this tutoring experience on my resume, but I need verifiable evidence. This platform can serve as proof, my profile displays the real cases of students I've helped, their actual reviews and ratings, and specific comments about how I improved their understanding. Employers and schools can verify this directly through the platform. Having documented student feedback and quantifiable results (like "helped 25 students improve by average 1 grade") makes my resume stand out and demonstrates my teaching abilities with real evidence, not just claims.

---

## 🎯 Need and Demand for Tu2tor Platform

### What is the purpose of Tu2tor, and why is it needed?

Tu2tor is a campus-based peer tutoring platform designed to connect Temasek Polytechnic students who need academic help with fellow students who can provide quality tutoring.

**Why peer tutoring matters**: A 2024 meta-analysis of 27 studies found that peer tutoring programs have a moderate, positive effect (g = 0.480) on college students' academic performance. In STEM subjects specifically—like DBAV and ADEV—a 2025 meta-analysis found a large significant effect (ES = 1.23, p < 0.001), meaning peer tutoring substantially improves academic achievement in technical courses. Importantly, studies found significantly larger effect sizes in Asia, suggesting peer learning aligns particularly well with Singapore's collaborative education culture. [Source: https://link.springer.com/article/10.1007/s40299-024-00960-0] [Source: https://www.sciencedirect.com/science/article/pii/S2666374025000123]

**The current problem**: While students have vast knowledge resources within their own community, there's no efficient way to connect those who need help with those who can provide it. The informal system—relying on WhatsApp groups, word-of-mouth, and bulletin boards—creates inefficiencies, information gaps, and trust barriers. Research on WhatsApp use in education highlights major coordination challenges including information overload in large group chats, 24/7 availability expectations, and messages getting lost in the noise. [Source: https://www.mdpi.com/2071-1050/14/19/12304] This infrastructure gap prevents peer learning's potential from being realized at scale.

### What is the main goal of the web app?

The main goal is to create a seamless, trustworthy, and efficient marketplace for peer-to-peer learning within the TP community.

Tu2tor transforms scattered informal arrangements into a structured, scalable peer learning ecosystem by:
- **Centralizing tutor discovery**: Students find qualified tutors through structured search instead of asking around in multiple WhatsApp groups
- **Streamlining booking management**: Automated scheduling prevents the chaos of coordinating through messaging apps
- **Building trust through quality assurance**: Reviews and ratings help students make informed decisions before committing credits
- **Rewarding knowledge sharing**: Credit system motivates talented students to help peers, knowing they're investing in their own future learning

**Digital-first approach**: In 2024, 60% of institutions observed that online classes tend to fill first, and 50% noted that online program enrollment is increasing faster than on-campus enrollment, showing strong student preference for digital solutions. [Source: https://research.com/education/online-education-statistics] Tu2tor meets this expectation by integrating video sessions, AI recommendations, and centralized booking—no more juggling multiple platforms.

### What problems or needs does it solve?

Tu2tor addresses five interconnected problems backed by research:

**Discovery Problem**: Students struggle to find qualified tutors beyond their immediate friend circle. While WhatsApp has high engagement rates (98% open rate), informal channels limit students to tutors within their existing social network, missing out on qualified tutors from other classes or cohorts. Research shows that structured platforms provide more systematic tutor discovery compared to asking around in group chats. [Source: https://sleekflow.io/blog/whatsapp-education]

**Coordination Problem**: Booking through WhatsApp creates coordination chaos. Research identifies major challenges including information overload in large group chats, 24/7 availability expectations where students expect tutors to be available at any time, and messages getting lost in the noise. These informal methods lack centralized scheduling and calendar integration, leading to scheduling conflicts and missed sessions. [Source: https://www.mdpi.com/2071-1050/14/19/12304]

**Trust & Motivation Problem**: No quality assurance exists—students can't assess tutor quality before booking. Research shows that high-performing students often lack motivation to tutor without structured incentive systems. Studies demonstrate that incentive reward systems (including credit-based compensation and gamification) notably enhance student engagement and participation, with external rewards complementing intrinsic motivation. [Source: https://www.nature.com/articles/s41599-025-04860-6]

**Integration Problem**: Juggling multiple platforms (Zoom, WhatsApp, email) creates technical friction. Students expect seamless digital solutions with integrated functionality rather than copying links and switching between apps.

**Personalization Problem**: Manually browsing dozens of profiles causes decision fatigue without intelligent matching based on learning history and peer success patterns.

### What gap or issue currently exists?

**The tutoring paradox**: Singapore has one of the world's strongest tutoring cultures. Families spent S$1.8 billion on private tutoring in 2023 (up almost 30% from 2018), with average household spending reaching S$104.80 per month in 2023 compared to S$88.40 in 2018. But this massive market focuses almost entirely on primary and secondary students through commercial agencies. [Source: https://smiletutor.sg/singapore-families-spent-1-8b-on-private-tuition-in-2023-heres-what-that-means-for-2025/] [Source: https://www.malaymail.com/news/singapore/2025/01/20/singapore-families-spent-s18-billion-on-private-tuition-in-2023-with-the-richest-spending-over-s162-per-month/163937]

**The polytechnic gap**: No centralized platform exists for student-to-student tutoring at the tertiary level. This gap is especially problematic for polytechnic students who benefit most from peer learning due to the practical, project-based nature of their curricula. As demonstrated by research, peer tutoring has larger effect sizes in Asia, making it particularly suitable for Singapore's education context. [Source: https://link.springer.com/article/10.1007/s40299-024-00960-0] Learning DBAV from someone who just completed the same assignment last semester is far more relevant than generic tutoring content.

**Wasted potential**: Current informal methods (WhatsApp, word-of-mouth, bulletin boards) waste time, create uncertainty, and severely underutilize the vast knowledge resources within the student body. Talented tutors remain invisible, struggling students can't find help, and everyone loses.

### Who are the target users and what are their needs?

Tu2tor serves two primary user groups within the Temasek Polytechnic community:

**Students (Tutees)** - TP students across all years and courses who need academic support, whether preparing for exams, completing projects, or understanding difficult concepts. Their needs include:
- Quick access to qualified tutors in specific subjects
- Transparency through reviews to make informed decisions
- Convenient online booking with automatic scheduling
- Integrated video sessions that work seamlessly
- Personalized recommendations based on learning history

**Student Tutors** - TP students who excel in subjects and want to help peers while earning credits and building their reputation. Their needs include:
- Visibility to showcase expertise and availability
- Centralized calendar to manage sessions without conflicts
- Feedback mechanisms to improve teaching
- Control over bookings through request-based system
- Recognition through badges and ratings

**School Administration** (secondary stakeholder) seeks to promote peer learning culture, monitor academic support effectiveness, and improve student success rates.

### How will Tu2tor make their lives easier?

**For students seeking help:**
- **Faster discovery**: Find the right tutor in minutes instead of days spent asking around in multiple group chats
- **Confident decisions**: Read authentic reviews to ensure credits are invested wisely rather than wasted on ineffective tutoring
- **Seamless sessions**: Join video tutoring with one click—no copying Zoom links, no downloading apps, no technical headaches
- **Smarter matching**: AI recommendations analyze learning history to suggest tutors who align with your progression, dramatically reducing browsing time and improving satisfaction

**For tutors:**
- **Effortless visibility**: Profile system showcases expertise, subjects, availability, and ratings without constant self-promotion
- **No scheduling chaos**: Centralized calendar automatically detects conflicts and prevents double-booking—no more endless WhatsApp coordination
- **Build credible reputation**: Reviews and badges make excellence visible, creating verifiable evidence for resumes and job applications
- **Stay in control**: Request-based booking lets tutors review and accept requests that match their schedule and expertise

**For both**: The credit system creates a sustainable ecosystem where helping others means helping your future self, turning peer tutoring from an altruistic burden into mutual benefit.

### What is the unique value proposition?

Tu2tor offers **"Trusted Peer Learning, Seamlessly Integrated"** - combining four unique elements that distinguish it from generic tutoring platforms:

**1. Campus-Exclusive Community - Peer-Level Learning That Works**

TP-only email verification (@tp.edu.sg) creates a closed, trusted community where all users are verified Temasek Polytechnic students. This exclusivity ensures:
- **True peer-to-peer matching**: Tutors recently completed the same courses (ADEV, DBAV, etc.) and understand TP's specific curriculum, assignment requirements, and teaching style
- **Shared context**: Both tutors and students speak the same language—they know the same lecturers, use the same course materials, and face identical project challenges
- **Campus safety**: Unlike open marketplaces where anyone can register, TP-only verification prevents external scammers and ensures accountability through student IDs
- **Network effects**: As more TP students join, the platform becomes increasingly valuable—students can find tutors for even niche subjects like specific electives or specialized modules

**2. Complete Integration - One Platform, Zero Friction**

End-to-end functionality eliminates the need to juggle multiple apps throughout the tutoring journey:
- **Discovery**: Advanced search with filters (subject, rating, price, availability) + AI-powered recommendations in one interface
- **Booking**: Integrated calendar shows tutor availability in real-time, request-based system lets tutors review and accept bookings, automatic conflict detection prevents double-booking
- **Communication**: Built-in messaging system for session coordination (currently 30% implemented)
- **Video Sessions**: One-click Jitsi Meet integration—no copying Zoom links, no downloading apps, no "can you send the link again?" messages. Unique floating video window lets students browse other pages while staying in the session
- **Payment**: Internal credit system eliminates awkward cash transactions, PayNow transfers, or payment disputes—credits automatically transfer upon session completion
- **Quality Assurance**: Post-session review prompts ensure feedback collection, reviews directly impact tutor rankings and visibility

This seamless flow means students go from "I need help with DBAV" to "I'm in a video session with a qualified tutor" without leaving the platform.

**3. AI-Powered Personalization - Smarter Than Manual Browsing**

OpenAI o1-preview engine analyzes individual learning patterns to deliver intelligent recommendations:
- **Learning history tracking**: System remembers subjects studied (e.g., "Previously took ADEV tutoring, now searching for React help") and suggests tutors who specialize in natural progression paths
- **Success pattern matching**: AI identifies which tutors have successfully helped students with similar backgrounds and learning goals
- **Context-aware chat assistant**: Students can ask natural language questions like "I'm struggling with database normalization in DBAV, who can help?" and receive personalized tutor recommendations with reasoning
- **Dynamic ranking**: Search results adapt based on student priorities—AI Priority Slider lets users weight "highest rating" vs "most available" to match their urgency
- **Continuous learning**: As more sessions complete and reviews accumulate, recommendations improve through feedback loops

This moves beyond simple keyword matching to understanding what makes a good tutor-student fit, dramatically reducing browsing time and improving satisfaction.

**4. Quality Assurance Built-In - Trust Through Transparency**

Multi-layered verification ensures students invest credits in proven tutors:
- **Verified booking history**: Reviews only appear after confirmed session completion—no fake reviews from friends or competitors
- **Comprehensive rating system**: 1-5 star ratings + written comments + helpful tags (Clear, Patient, Knowledgeable) give multi-dimensional quality insights
- **Tutor response mechanism**: Tutors can reply to reviews professionally, demonstrating accountability and addressing student concerns
- **Performance badges**: Automatically awarded based on objective criteria (Newbie: 0-5 sessions, Rising Star: 10+ sessions with 4.5+ rating, Expert: 30+ sessions with 4.7+ rating, Top Tutor: 50+ sessions with 4.8+ rating) provide at-a-glance credibility indicators
- **Real-time statistics**: Each tutor profile displays total sessions completed, average rating, response rate, and completion rate—no hidden metrics
- **Anonymous review option**: Students can leave honest feedback without fear of retaliation, while still having reviews tied to verified bookings

Unlike informal WhatsApp arrangements where students gamble on unknown tutors, Tu2tor's quality assurance lets them make informed decisions backed by transparent data.

### What makes Tu2tor stand out from existing solutions?

Tu2tor distinguishes itself through innovative features not found in competing platforms:

- **Integrated Video with Floating Window**: Join Jitsi sessions with one click and continue browsing in a draggable floating window—unique multitasking capability for checking schedules or notes while in session
- **Request-Based Pairing System**: Students send requests with learning goals; tutors review and accept based on fit—ensuring mutual commitment rather than automatic matching
- **Credit-Based Economy**: Internal credits eliminate real money transactions, making peer tutoring accessible and frictionless
- **AI Chat Assistant**: Real-time conversational support for clarifying doubts, study tips, and tutor recommendations
- **Polytechnic-Specific Design**: Tailored for TP's project-based learning environment, not a generic marketplace

### Why would users choose Tu2tor over alternatives?

**vs. WhatsApp/Informal Methods:**
- Centralized discovery vs. scattered group chats
- Quality assurance through reviews vs. unknown quality
- Automated scheduling vs. manual coordination
- Integrated video vs. lost Zoom links

**vs. Commercial Tutoring Platforms:**
- Peer-to-peer learning (equally effective, lower cost) vs. expensive professional tutors
- Campus-exclusive community vs. generic marketplace
- Credit system vs. cash payments
- Subject relevance (tutors who recently passed courses) vs. generic content

**vs. LMS/Learning Platforms:**
- Live 1-on-1 tutoring vs. static resources
- Personalized AI recommendations vs. course catalogs
- Social learning community vs. isolated studying
- Practical project help vs. theoretical content

**The Tu2tor Advantage**: The only platform designed specifically for TP peer tutoring that combines trusted matchmaking, seamless booking, integrated video, AI personalization, and quality assurance in one complete solution.

### Research Sources

All data and statistics in this section are from verified research sources:

**Peer Tutoring Effectiveness:**
- "The Impact of Peer Tutoring Programs on Students' Academic Performance in Higher Education: A Meta-analysis" (2024) - https://link.springer.com/article/10.1007/s40299-024-00960-0
- "A Meta-analysis of the effect of peer tutoring in STEM subjects" (2025) - https://www.sciencedirect.com/science/article/pii/S2666374025000123

**Singapore Tutoring Market:**
- SmileTutor Industry Report (2024) - https://smiletutor.sg/singapore-families-spent-1-8b-on-private-tuition-in-2023-heres-what-that-means-for-2025/
- Malay Mail Singapore Education Statistics (2025) - https://www.malaymail.com/news/singapore/2025/01/20/singapore-families-spent-s18-billion-on-private-tuition-in-2023-with-the-richest-spending-over-s162-per-month/163937

**Online Learning Adoption:**
- Research.com Online Education Statistics (2024) - https://research.com/education/online-education-statistics

**WhatsApp & Coordination Challenges:**
- "WhatsApp as a University Tutoring Resource" MDPI Sustainability (2022) - https://www.mdpi.com/2071-1050/14/19/12304
- SleekFlow WhatsApp for Education Report - https://sleekflow.io/blog/whatsapp-education

**Incentive Systems & Motivation:**
- "Peer tutoring in higher education: power from pedagogical training" Nature (2025) - https://www.nature.com/articles/s41599-025-04860-6

---

## 🔧 Proposed Features (3%)

### Outline of Planned Functionalities

The Tu2tor platform comprises 8 core feature modules designed to provide a complete peer tutoring ecosystem. Below is a detailed breakdown of 23 planned functionalities:

| Feature Name | Description / Purpose | User Actions / What It Does | Expected Outcome / Display | Notes / Future Plans |
|---|---|---|---|---|
| **User Registration & Authentication** | Allow TP students to create accounts and securely access the platform with JWT-based authentication | Users sign up with TP email, create password, verify email, and login | Authenticated session with 30-day token; personalized dashboard access | May integrate TP SSO (Single Sign-On) for seamless campus authentication |
| **Tutor Profile Creation** | Enable students to register as tutors by creating comprehensive profiles showcasing their expertise | Users fill profile with bio, subjects, hourly rate, available time slots, preferred locations, and upload profile picture | Complete tutor profile displayed in search results with ratings, badges, and availability status | May add video introductions and teaching methodology descriptions |
| **Advanced Search & Filters** | Help students quickly find tutors matching specific criteria using multi-dimensional filtering | Users enter subject, select price range, minimum rating, availability days, and online/offline preference | Filtered list of tutors ranked by relevance; results update in real-time as filters change | Future: Add experience level filter and response time metrics |
| **AI Priority Slider** | Allow students to customize search ranking based on their priorities (rating vs. availability) | Users adjust slider between "Rating Priority" and "Availability Priority" | Search results re-rank dynamically—rating priority shows highest-rated tutors first; availability priority shows tutors with most open slots | May expand to multi-criteria optimization (price, location, specialty) |
| **Tutor Detail View** | Provide comprehensive information about a tutor before booking | Users click on tutor card to view full profile, read reviews, check detailed availability calendar, see statistics | Full-screen profile showing bio, subjects, ratings breakdown, student reviews with tags, completed sessions count, response rate | May add "Ask Question" feature for pre-booking inquiries |
| **Booking Request System** | Enable request-based pairing where students send booking requests and tutors accept/decline | Students select date, time slot, duration (30min-3hrs), location, add notes about learning goals; submit request to tutor | Booking created in "pending" status; tutor receives notification and can accept/decline; upon acceptance, status changes to "confirmed" | May add instant booking option for tutors who enable auto-accept |
| **Calendar Integration** | Display personalized calendar showing upcoming, active, and completed sessions | Users view calendar with color-coded sessions; click session for details | Calendar view with upcoming sessions highlighted; shows date, time, tutor/student name, subject, location; prevents double-booking | May sync with Google Calendar and send reminder notifications |
| **Credit Management** | Manage internal credit system for booking payments without real money transactions | Users start with 500 credits; booking deducts credits based on (hourly_rate × duration); completed sessions transfer credits to tutor | Dashboard displays current credit balance; transaction history shows debits and credits; low balance warning | May add credit purchase system or earning credits through referrals |
| **Video Session Room** | Provide integrated Jitsi Meet video conferencing for online tutoring sessions | Students click "Join Session Now" button (available ±15 minutes from scheduled time); enters almost-fullscreen video room | Jitsi video interface occupies calc(100vh-180px); session info bar below with subject, tutor name, time; unlimited re-entry during time window | Session recordings may be added for review purposes |
| **Floating Video Window** | Enable multitasking by minimizing video to draggable floating window | Users click "Minimize" button in video room; window becomes 400×280px draggable overlay | Floating window appears in bottom-right; users can drag to any position; can browse other pages while video continues; "Maximize" button returns to full view | May add picture-in-picture mode for better browser compatibility |
| **Session Notes** | Allow users to take notes during tutoring sessions for future reference | Users type notes in text area within session room; notes auto-save | Notes stored with session record; accessible from booking history; searchable for future review | May add collaborative notes feature where both tutor and student contribute |
| **Review & Rating System** | Enable quality assurance through student reviews of completed sessions | After session completion, students rate 1-5 stars, write comment (10-1000 chars), select tags (Clear, Patient, Knowledgeable), choose anonymous option | Review posted on tutor profile; tutor's average rating updates automatically via Mongoose middleware; reviews display with helpful count and tutor response | May add photo uploads and form field feedback later on |
| **Tutor Response to Reviews** | Allow tutors to respond to student reviews professionally | Tutors view reviews on their profile and can write responses to address feedback | Response appears below student review; shows tutor's perspective; builds trust through transparency | May add review flagging system for inappropriate content |
| **Badge System** | Gamify excellence through performance badges rewarding quality tutoring | System automatically awards badges based on criteria: Newbie (0-5 sessions), Rising Star (10+ sessions, 4.5+ rating), Expert (30+ sessions, 4.7+ rating), Top Tutor (50+ sessions, 4.8+ rating) | Badges display prominently on tutor profiles and search results; creates visual credibility indicators | May add subject-specific badges and student achievement badges |
| **AI Recommendation Engine** | Provide intelligent tutor suggestions using OpenAI o1-preview based on learning history | Students open AI chat assistant; ask questions like "I need help with React hooks" or "Recommend an ADEV tutor" | AI analyzes student's previous bookings, subjects studied, review patterns; responds with personalized tutor recommendations with reasoning; supports multi-turn conversation | May expand to recommend study schedules, learning paths, and study groups |
| **AI Chat Interface** | Offer conversational AI support for study help and platform guidance | Users type questions in chat interface; AI responds with context-aware answers; code snippets display with syntax highlighting | Real-time responses with markdown formatting; chat history saved to user account; can reference previous conversations | May add voice input and integration with course materials |
| **Dashboard Analytics** | Visualize personal statistics and activity using Recharts | Users view dashboard with stats cards and charts showing sessions completed, average rating (for tutors), credits earned/spent, upcoming sessions | Recharts visualizations: radial bar charts for profile completion, area charts for activity trends, calendar heatmap for session frequency | May add comparative analytics showing performance vs. peers |
| **Booking Management** | Centralized view of all bookings with status filtering | Users view bookings page filtered by status: Pending (awaiting confirmation), Confirmed (upcoming sessions), Completed (past sessions), Cancelled | Each booking card shows subject, date, time, tutor/student name, cost, status badge; click to view details or take actions (cancel, reschedule, review) | May add bulk actions and export to CSV |
| **Notification System** | Keep users informed of important events and updates | System sends notifications for: booking requests, confirmations, upcoming sessions (1hr before), new reviews, low credit balance | Notification center displays unread notifications with timestamps; real-time updates; click to navigate to relevant page | Currently at 50% completion; may add email and mobile push notifications |
| **Messaging System** | Enable direct communication between students and tutors | Users click "Message" on tutor profile; real-time chat interface opens; send text messages about session details | Chat history preserved per conversation; shows online/offline status; typing indicators; message read receipts | Currently at 30% completion; may integrate voice/video calls |
| **Session Completion** | Automatically mark sessions as completed after scheduled end time | System checks booking end time; automatically updates status from "confirmed" to "completed" 15 minutes after scheduled end | Booking status changes; triggers review request notification to student; credits transfer to tutor account | Session archiving may be implemented for algorithmic improvements |
| **Search History** | Track student search patterns to improve recommendations | System logs search queries, filters used, tutors clicked, bookings made | Data used by AI engine to understand student preferences; improves future recommendations; not directly visible to users | Privacy-compliant; anonymized data may inform platform improvements |
| **Real-time Collaborative Code Editor** | Enable multi-party live coding during tutoring sessions using embedded Monaco Editor (VSCode core) | Students and tutors access split-screen view with video on left, code editor on right; both can type simultaneously; select programming language; run code with integrated compiler | Real-time synchronized editing with multi-cursor display (different colors per user); syntax highlighting for 20+ languages; IntelliSense code completion; instant code execution results; chat overlay for code-specific discussions | Uses Yjs CRDT + WebSocket for conflict-free synchronization; Judge0 API for code execution; saves code snapshots per session; particularly valuable for DBAV, Python, Java courses |

### Feature Implementation Status

**✅ Fully Implemented (100%):**
- User Registration & Authentication
- Tutor Profile Creation & Management
- Advanced Search & Filters with AI Priority Slider
- Booking Request System with Calendar
- Video Session Room with Floating Window
- Review & Rating System with Responses
- Badge System
- AI Recommendation Engine with Chat Interface
- Dashboard Analytics
- Booking Management
- Credit Management System

**🔄 In Progress:**
- Notification System (50%)
- Messaging System (30%)

**📋 Planned Features (Not Yet Implemented):**
- Real-time Collaborative Code Editor (detailed in features table above)

**📋 Future Enhancements:**
- Session recordings with automatic transcription
- TP SSO integration for seamless campus login
- Mobile app (React Native) for on-the-go access
- Voice/video messaging for asynchronous communication
- Collaborative session notes with rich text formatting
- Code snippet library for tutors to share examples
- Advanced analytics dashboard with learning insights

---

## 🗄️ Data Modeling (5%)

### Identification of Key Models & Attributes

The Tu2tor platform requires 6 core data models to support the complete peer tutoring ecosystem. Each model is designed with logical relationships and appropriate attributes to ensure data integrity and efficient querying.

### Core Data Models

---

#### **Table: User**

**Description:**
Stores fundamental user information for authentication and profile management. Serves as the base model for all platform users.

**Usage in App:**
Handles user registration, login authentication, profile display, and role management. Used throughout the platform to identify students and tutors, track credits, and manage account settings.

| Attribute | Type | Sample Value | Description |
|-----------|------|--------------|-------------|
| _id | ObjectId | user_001 | Unique identifier for each user, automatically generated by MongoDB. |
| username | String | alice_student | Display name shown on profile, bookings, and reviews. Required field. |
| email | String | alice@tp.edu.sg | Temasek Polytechnic email address used for authentication and notifications. Must be unique. |
| password | String | $2b$10$... | Bcrypt hashed password for secure authentication. Never stored in plain text. |
| role | Array[String] | ['student', 'tutor'] | User roles allowing multi-role support. Users can be both student and tutor simultaneously. |
| school | String | Temasek Polytechnic | Educational institution name, used for campus-specific filtering. |
| course | String | Information Technology | Major or diploma program, displayed on profile and used for matching. |
| yearOfStudy | Number | 2 | Academic year (1, 2, or 3), helps match students with appropriate tutors. |
| credits | Number | 150 | Platform currency for booking sessions. Default: 500 credits upon registration. |
| badges | Array[String] | ['First Session', 'Top Reviewer'] | Achievement badges earned through platform activities, displayed on profile. |
| profilePicture | String | /uploads/avatar123.jpg | URL path to user's profile image. Optional field. |
| profileCompletion | Number | 80 | Percentage (0-100) indicating how complete the profile is. Encourages full profile setup. |
| createdAt | Date | 2025-10-01T10:30:00Z | Timestamp of account creation, auto-generated. |
| updatedAt | Date | 2025-11-15T14:20:00Z | Timestamp of last profile update, auto-updated. |

**Relationships:**
- One-to-One with Tutor (if user has tutor role)
- One-to-Many with Booking (as student or tutor)
- One-to-Many with Review (as student or tutor)

---

#### **Table: Tutor**

**Description:**
Extended profile for users offering tutoring services. Contains specialized information about teaching capabilities, availability, and performance metrics.

**Usage in App:**
Manages tutor-specific data displayed on tutor profiles, search results, and AI matching system. Tracks session statistics and ratings for quality assurance.

| Attribute | Type | Sample Value | Description |
|-----------|------|--------------|-------------|
| _id | ObjectId | tutor_001 | Unique identifier for tutor profile. |
| userId | ObjectId (ref: 'User') | user_010 | Reference to associated User model. Enables one-to-one relationship. |
| bio | String | AI and Machine Learning specialist. Passionate about data science... | Personal introduction displayed on tutor profile. Maximum 500 characters. |
| subjects | Array[Object] | [{code: 'IOT', name: 'Internet of Things', grade: 'A+'}] | Array of subjects the tutor can teach with their achieved grades. |
| hourlyRate | Number | 45 | Credits charged per hour of tutoring. Range: 20-60 credits. |
| availableSlots | Array[Object] | [{day: 'Tuesday', startTime: '19:00', endTime: '22:00'}] | Weekly availability schedule for booking matching and filtering. |
| preferredLocations | Array[String] | ['Online', 'TP IT Lab', 'IIT-pixel X'] | Locations where tutor is willing to conduct sessions. |
| totalSessions | Number | 75 | Lifetime count of all sessions (completed and ongoing). |
| completedSessions | Number | 73 | Number of successfully completed sessions, used for reliability metrics. |
| averageRating | Number | 4.95 | Calculated average from all reviews (1-5 scale). Auto-updated via middleware. |
| totalReviews | Number | 32 | Count of reviews received, displayed alongside rating. |
| responseTime | Number | 45 | Average minutes to respond to booking requests. Lower is better. |
| isAvailable | Boolean | true | Whether tutor is currently accepting new bookings. |
| createdAt | Date | 2025-09-15T08:00:00Z | Timestamp when tutor profile was created. |
| updatedAt | Date | 2025-11-18T16:45:00Z | Timestamp of last tutor profile update. |

**Relationships:**
- One-to-One with User (via userId)
- One-to-Many with Booking
- One-to-Many with Review

**Business Logic:**
- `averageRating` auto-calculated via Mongoose middleware when new reviews added
- `totalSessions` increments when booking status changes to 'completed'

---

#### **Table: Booking**

**Description:**
Manages tutoring session requests, schedules, and status tracking throughout the booking lifecycle from creation to completion.

**Usage in App:**
Central model for booking workflow. Handles session creation, confirmation, scheduling, video room generation, and status management. Displayed in My Bookings, Sessions, and Dashboard.

| Attribute | Type | Sample Value | Description |
|-----------|------|--------------|-------------|
| _id | ObjectId | booking_001 | Unique identifier for each booking. |
| studentId | ObjectId (ref: 'User') | user_001 | Reference to User model of the student making the booking. |
| tutorId | ObjectId (ref: 'Tutor') | tutor_001 | Reference to Tutor model of the tutor being booked. |
| subject | String | DBAV | Course code or subject name for the session. Required field. |
| date | Date | 2025-11-15T14:00:00Z | Session start date and time. Used for scheduling and reminders. |
| timeSlot | String | 14:00-15:00 | Human-readable time range displayed in booking cards. |
| duration | Number | 1 | Session length in hours (0.5, 1, 1.5, 2, or 3). |
| location | String | TP Library | Venue for session. Can be 'Online' or physical location. |
| sessionType | String | online | Type of session: 'online' or 'offline'. Determines if video room is created. |
| meetingRoomId | String | tutoring-booking001-1699438401913 | Auto-generated Jitsi room ID for online sessions. Format: tutoring-{bookingId}-{timestamp}. |
| status | String | confirmed | Booking state: 'pending', 'confirmed', 'completed', or 'cancelled'. |
| cost | Number | 45 | Total credits charged. Calculated as: hourlyRate × duration. |
| notes | String | Help with database optimization | Student's learning goals or specific questions for the session. |
| hasReview | Boolean | true | Quick flag indicating if student has left a review. Used for filtering. |
| cancellationReason | String | Schedule conflict | Reason provided if booking is cancelled. Optional field. |
| createdAt | Date | 2025-11-10T10:00:00Z | Timestamp when booking was created. |
| updatedAt | Date | 2025-11-15T15:30:00Z | Timestamp of last booking update (status change, etc.). |

**Relationships:**
- Many-to-One with User (student)
- Many-to-One with Tutor
- One-to-One with Review

**Status Flow:**
```
pending → confirmed → completed
         ↓
      cancelled
```

**Business Logic:**
- `meetingRoomId` auto-generated for online sessions: `tutoring-${bookingId}-${timestamp}`
- `cost` calculated as: `tutorHourlyRate × duration`
- Status can auto-update to 'completed' after scheduled end time

---

#### **Table: Review**

**Description:**
Enables quality assurance through student feedback on completed tutoring sessions. Supports rating, comments, tags, and tutor responses.

**Usage in App:**
Displayed on tutor profiles, review pages, and influences averageRating calculations. Verified reviews build trust and help students make informed decisions.

| Attribute | Type | Sample Value | Description |
|-----------|------|--------------|-------------|
| _id | ObjectId | review_001 | Unique identifier for each review. |
| bookingId | ObjectId (ref: 'Booking') | booking_001 | Reference to the booking being reviewed. Ensures one review per booking (unique index). |
| tutorId | ObjectId (ref: 'User') | user_002 | Reference to the tutor being reviewed. Used for aggregating tutor ratings. |
| studentId | ObjectId (ref: 'User') | user_001 | Reference to the student who wrote the review. |
| rating | Number | 5 | Star rating from 1 to 5. Required field. |
| comment | String | Excellent tutor! Bob explained database optimization concepts very clearly... | Written feedback. Length: 10-1000 characters. |
| tags | Array[String] | ['Clear Explanations', 'Patient', 'Knowledgeable'] | Predefined tags describing teaching style and strengths. |
| isAnonymous | Boolean | false | If true, student identity is hidden on public review display. |
| isVerified | Boolean | true | True if booking exists and is completed. Verified badge shows on reviews. |
| helpfulCount | Number | 3 | Number of upvotes from other students finding the review helpful. |
| tutorResponse | String | Thank you Alice! It was great working with you... | Tutor's reply to the review. Optional field. |
| tutorResponseDate | Date | 2025-10-21T10:00:00Z | Timestamp when tutor responded to review. |
| createdAt | Date | 2025-10-15T16:00:00Z | Timestamp when review was submitted. |
| updatedAt | Date | 2025-10-21T10:05:00Z | Timestamp of last review update (e.g., tutor response added). |

**Relationships:**
- One-to-One with Booking (via bookingId)
- Many-to-One with User (tutor)
- Many-to-One with User (student)

**Business Logic:**
- Can only be created if `booking.status === 'completed'`
- `isVerified` is true if booking exists and is completed
- Creating review triggers Tutor model `averageRating` recalculation via middleware
- One review per booking enforced via unique index on bookingId

---

#### **Table: Subject**

**Description:**
Centralized catalog of available subjects for tutoring with metadata for categorization, prerequisites, and demand tracking.

**Usage in App:**
Referenced by Tutor profiles (subjects taught) and Bookings (session subject). Used in search filters, AI matching, and analytics to track popular subjects.

| Attribute | Type | Sample Value | Description |
|-----------|------|--------------|-------------|
| _id | ObjectId | subject_001 | Unique identifier for each subject. |
| code | String | DBAV | Short course code. Must be unique. Used in bookings and tutor profiles. |
| name | String | Database and Advanced Visualization | Full subject name displayed in UI. |
| category | String | Information Technology | Subject category for filtering: 'IT', 'Business', 'Engineering', etc. |
| yearLevel | Number | 2 | Academic year level (1, 2, or 3). Helps match students with appropriate tutors. |
| description | String | Learn database design, SQL optimization... | Brief subject overview displayed in search and subject details. |
| prerequisites | Array[String] | ['Intro to Databases'] | List of prerequisite subjects. Helps students understand learning path. |
| isActive | Boolean | true | Whether subject is currently offered. Inactive subjects hidden from search. |
| tutorCount | Number | 8 | Number of tutors teaching this subject. Updated when tutors add/remove subjects. |
| demandScore | Number | 87 | Popularity metric based on recent booking frequency. Updated weekly for AI recommendations. |
| createdAt | Date | 2025-09-01T00:00:00Z | Timestamp when subject was added to catalog. |
| updatedAt | Date | 2025-11-18T12:00:00Z | Timestamp of last subject information update. |

**Relationships:**
- Referenced by Tutor.subjects (array)
- Referenced by Booking.subject (string)

**Business Logic:**
- `tutorCount` auto-updated when tutors add/remove subjects from their profiles
- `demandScore` calculated weekly based on booking frequency for AI recommendation algorithm

---

### Entity Relationship Diagram (ERD)

```
┌─────────┐         ┌─────────┐
│  User   │────1:1──│  Tutor  │
└─────────┘         └─────────┘
     │                   │
     │ 1:M           M:1 │
     │                   │
     ▼                   ▼
┌──────────────────────────┐
│       Booking            │
└──────────────────────────┘
            │ 1:1
            ▼
       ┌─────────┐
       │ Review  │
       └─────────┘

┌─────────┐
│ Subject │ (Referenced by Tutor & Booking)
└─────────┘
```

### Data Modeling Design Highlights

**1. Normalization Strategy:**
- Tutor data separated from User model to avoid null fields for non-tutors
- Subject stored as string reference rather than embedded objects to allow centralized updates
- Review linked to Booking to prevent duplicate reviews and maintain data integrity

**2. Denormalization for Performance:**
- `averageRating`, `totalReviews`, `completedSessions` stored directly in Tutor model (updated via Mongoose middleware) to avoid expensive aggregation queries on every page load
- `hasReview` boolean in Booking enables quick filtering without joining Review collection

**3. Data Integrity Measures:**
- Unique indexes enforced: User.email, Tutor.userId, Review.bookingId, Subject.code
- Required fields enforced at schema level to prevent incomplete records
- Enum validation for status and role fields to ensure valid state values
- Referential integrity maintained through ObjectId references

**4. Scalability Considerations:**
- ObjectId references instead of embedding for large collections (Bookings, Reviews)
- Strategic indexing on frequently queried fields: email, userId, studentId, tutorId, status, date
- Composite indexes for common query patterns: (tutorId + status), (studentId + status), (date + status)
- Pagination support through createdAt timestamps and skip/limit queries

**5. Sample Data Flow:**

```
User Registration (Alice)
         ↓
User searches for DBAV tutor
         ↓
AI Matching recommends maya_tutor (87% match)
         ↓
Alice creates Booking (pending) → Credits deducted
         ↓
maya_tutor confirms → Status: confirmed, meetingRoomId generated
         ↓
Session occurs → Status auto-updates to completed
         ↓
Alice creates Review (5 stars) → Tutor.averageRating recalculated
         ↓
Review displayed on maya_tutor profile
```

This comprehensive data modeling approach ensures efficient queries, maintains data consistency, supports complex business logic, and scales effectively as the platform grows.

---

### SQL Schema (for ERD Generation)

The following SQL schema can be used to generate Entity Relationship Diagrams for presentation purposes. Note that the actual implementation uses MongoDB with Mongoose ODM.

```sql
-- ============================================
-- Table: User
-- ============================================
CREATE TABLE User (
    _id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    school VARCHAR(100) DEFAULT 'Temasek Polytechnic',
    major VARCHAR(100) NOT NULL,
    yearOfStudy INT NOT NULL CHECK (yearOfStudy BETWEEN 1 AND 3),
    phoneNumber VARCHAR(20),
    profilePicture VARCHAR(255),
    credits INT DEFAULT 100,
    badges TEXT,
    profileCompletion INT DEFAULT 50,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Table: Tutor
-- ============================================
CREATE TABLE Tutor (
    _id VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50) NOT NULL UNIQUE,
    bio TEXT,
    subjects TEXT,
    hourlyRate DECIMAL(10,2) DEFAULT 10.00,
    availableSlots TEXT,
    preferredLocations TEXT,
    totalSessions INT DEFAULT 0,
    completedSessions INT DEFAULT 0,
    averageRating DECIMAL(3,2) DEFAULT 0.00,
    totalReviews INT DEFAULT 0,
    responseTime INT DEFAULT 120,
    isAvailable BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(_id)
);

-- ============================================
-- Table: Booking
-- ============================================
CREATE TABLE Booking (
    _id VARCHAR(50) PRIMARY KEY,
    studentId VARCHAR(50) NOT NULL,
    tutorId VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    date TIMESTAMP NOT NULL,
    timeSlot VARCHAR(50) NOT NULL,
    duration INT DEFAULT 60,
    location VARCHAR(255) NOT NULL,
    sessionType VARCHAR(20) DEFAULT 'online',
    meetingRoomId VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    cost DECIMAL(10,2) NOT NULL,
    notes TEXT,
    hasReview BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES User(_id),
    FOREIGN KEY (tutorId) REFERENCES Tutor(_id)
);

-- ============================================
-- Table: Review
-- ============================================
CREATE TABLE Review (
    _id VARCHAR(50) PRIMARY KEY,
    bookingId VARCHAR(50) NOT NULL UNIQUE,
    tutorId VARCHAR(50) NOT NULL,
    studentId VARCHAR(50) NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    tags TEXT,
    isAnonymous BOOLEAN DEFAULT false,
    isVerified BOOLEAN DEFAULT false,
    helpfulCount INT DEFAULT 0,
    tutorResponse TEXT,
    tutorResponseDate TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bookingId) REFERENCES Booking(_id),
    FOREIGN KEY (tutorId) REFERENCES User(_id),
    FOREIGN KEY (studentId) REFERENCES User(_id)
);

-- ============================================
-- Table: Subject
-- ============================================
CREATE TABLE Subject (
    _id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    yearLevel INT CHECK (yearLevel BETWEEN 1 AND 3),
    description TEXT,
    prerequisites TEXT,
    isActive BOOLEAN DEFAULT true,
    tutorCount INT DEFAULT 0,
    demandScore INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relationships:
-- User (1:1) Tutor
-- User (1:M) Booking (as student)
-- Tutor (1:M) Booking
-- Booking (1:1) Review
-- Subject (M:M) Tutor/Booking (via text references)
```

**完整SQL文件**: `archived_docs/Tu2tor_Database_Schema.sql`

---

## 🎨 Wireframe (5%)

### Part 1: Use Case Diagram

**Tu2tor System - Use Case Diagram**

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Tu2tor Platform                             │
│                                                                       │
│                                                                       │
│   ┌──────────────────────────────────────────────────────┐          │
│   │              Login & Authentication                   │          │
│   └──────────────────────────────────────────────────────┘          │
│                            ▲                                         │
│                            │                                         │
│   ┌────────┐              │              ┌────────┐                │
│   │Student │──────────────┼──────────────│ Tutor  │                │
│   │ Tutee  │              │              │        │                │
│   └────────┘              │              └────────┘                │
│       │                   │                   │                      │
│       │                   │                   │                      │
│       ├──────────┐        │        ┌─────────┤                     │
│       │          │        │        │         │                      │
│       ▼          ▼        ▼        ▼         ▼                      │
│  ┌────────┐ ┌────────┐        ┌────────┐ ┌────────┐               │
│  │ Search │ │ View   │        │ Create │ │ Manage │               │
│  │ Tutors │ │ Tutor  │        │ Profile│ │ Availa-│               │
│  │        │ │ Profile│        │        │ │ bility │               │
│  └────────┘ └────────┘        └────────┘ └────────┘               │
│       │          │                   │         │                    │
│       │          │                   │         │                    │
│       ▼          ▼                   ▼         ▼                    │
│  ┌────────┐ ┌────────┐        ┌────────┐ ┌────────┐               │
│  │ Send   │ │ Write  │        │ Accept/│ │ Set    │               │
│  │ Booking│ │ Review │        │ Decline│ │ Hourly │               │
│  │ Request│ │        │        │ Request│ │ Rate   │               │
│  └────────┘ └────────┘        └────────┘ └────────┘               │
│       │          │                   │         │                    │
│       │          │                   │         │                    │
│       │          │    ┌──────────┐  │         │                    │
│       └──────────┼───→│ Join     │←─┼─────────┘                    │
│                  │    │ Video    │  │                               │
│                  │    │ Session  │  │                               │
│                  │    └──────────┘  │                               │
│                  │         │        │                               │
│                  │         │        │                               │
│                  │    ┌────▼────┐  │                               │
│                  │    │ View AI │  │                               │
│                  ├───→│ Recom-  │←─┤                               │
│                  │    │ menda-  │  │                               │
│                  │    │ tions   │  │                               │
│                  │    └─────────┘  │                               │
│                  │                  │                               │
│                  │    ┌─────────┐  │                               │
│                  └───→│ Manage  │←─┘                               │
│                       │ Bookings│                                   │
│                       └─────────┘                                   │
│                                                                      │
│   <<extends>>                                                        │
│   Send Booking Request ──→ Request Accepted                         │
│                        └──→ Request Declined                         │
│                                                                      │
│   Join Video Session ──→ Minimize to Floating Window                │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Use Case Descriptions:**

**Common Use Cases (Both Actors):**
- **Login & Authentication**: Users sign up with TP email and login to access personalized dashboard
- **View AI Recommendations**: Get intelligent tutor suggestions based on learning history and preferences
- **Manage Bookings**: View and manage upcoming, pending, and completed tutoring sessions
- **Join Video Session**: Enter integrated Jitsi Meet video room for online tutoring

**Student Tutee Use Cases:**
- **Search Tutors**: Filter tutors by subject, price range, rating, and availability using advanced search
- **View Tutor Profile**: See complete tutor information including bio, ratings, reviews, and statistics
- **Send Booking Request**: Submit booking request with date, time, duration, location, and learning goals
- **Write Review**: Rate and review tutor after completed session (1-5 stars with comments and tags)

**Tutor Use Cases:**
- **Create Profile**: Set up tutor profile with bio, subjects, hourly rate, and profile picture
- **Manage Availability**: Define available time slots for tutoring sessions
- **Accept/Decline Request**: Review incoming booking requests and approve or reject based on fit
- **Set Hourly Rate**: Configure pricing for tutoring services
- **Respond to Reviews**: Reply to student reviews professionally

**Extended Use Cases:**
- **Request Accepted** (extends Send Booking Request): Booking status changes to "confirmed"; both parties receive notification
- **Request Declined** (extends Send Booking Request): Student notified; can search for alternative tutors
- **Minimize to Floating Window** (extends Join Video Session): Video continues in 400×280px draggable window while browsing platform

---

### Part 2: User Navigation Flow Diagram

**Tu2tor Platform - User Navigation Flow**

```
                                                ┌─────────────┐
                                                │   Logout    │──→ End
                                                └─────────────┘
                                                      ▲
                                                      │
                    ┌─────────────────────────────────────────────────┐
                    │          User Dashboard (Home)                  │
                    └─────────────────────────────────────────────────┘
                                    ▲                 │
                                    │                 │
                    ┌───────────────┴────┬────────────┴────────────┐
                    │                    │                         │
                    ▼                    ▼                         ▼
            ┌─────────────┐      ┌─────────────┐         ┌─────────────┐
            │   Profile   │      │   Search    │         │  Bookings   │
            │   Settings  │      │   Tutors    │         │    Page     │
            └─────────────┘      └─────────────┘         └─────────────┘
                    │                    │                         │
        ┌───────────┼────────────┐      │               ┌─────────┼─────────┐
        │           │            │      │               │         │         │
        ▼           ▼            ▼      ▼               ▼         ▼         ▼
  ┌─────────┐ ┌─────────┐ ┌─────────┐ │         ┌─────────┐ ┌─────────┐ ┌─────────┐
  │  Edit   │ │  Manage │ │  Tutor  │ │         │ Pending │ │Confirmed│ │Completed│
  │ Profile │ │  Slots  │ │ Profile │ │         │Requests │ │Sessions │ │Sessions │
  └─────────┘ └─────────┘ └─────────┘ │         └─────────┘ └─────────┘ └─────────┘
                                       │               │         │         │
                                       │               │         │         │
                                       ▼               ▼         ▼         ▼
                              ┌─────────────┐   ┌─────────┐ ┌─────────┐ ┌─────────┐
                              │Filter Results│   │ Accept/ │ │  Join   │ │ Write   │
                              │By: Subject,  │   │ Decline │ │ Video   │ │ Review  │
                              │Rating, Price,│   └─────────┘ │ Session │ └─────────┘
                              │Availability  │               └─────────┘
                              └─────────────┘                     │
                                       │                          │
                                       ▼                          ▼
                              ┌─────────────┐           ┌─────────────┐
                              │ View Tutor  │           │  Floating   │
                              │   Detail    │           │   Video     │
                              │   Page      │           │   Window    │
                              └─────────────┘           └─────────────┘
                                       │
                                       ▼
                              ┌─────────────┐
                              │  Send Book- │
                              │ing Request  │
                              │   (Modal)   │
                              └─────────────┘
                                       │
                                       ▼
                              ┌─────────────┐
                              │  Success    │
                              │Notification │
                              └─────────────┘


┌──────────┐        ┌──────────┐        ┌──────────┐
│  Start   │───────→│  Login   │───────→│   Home   │
│          │        │   Page   │        │Dashboard │
└──────────┘        └──────────┘        └──────────┘
                         ▲                     │
                         │                     │
                    ┌────┴─────┐              │
                    │          │              │
                    │  Sign Up │              ▼
                    │   Page   │      ┌─────────────┐
                    │          │      │  AI Chat    │
                    └──────────┘      │  Assistant  │
                         │            └─────────────┘
                         │                     │
                         ▼                     ▼
                    ┌──────────┐      ┌─────────────┐
                    │ Complete │      │    Get      │
                    │  Profile │      │Personalized │
                    │  Setup   │      │Recommenda-  │
                    │          │      │   tions     │
                    └──────────┘      └─────────────┘
```

**Navigation Flow Descriptions:**

**Primary User Flows:**

1. **New User Onboarding:**
   - Start → Login Page → Sign Up Page → Complete Profile Setup → Home Dashboard

2. **Finding a Tutor (Student Journey):**
   - Home Dashboard → Search Tutors → Apply Filters (Subject, Rating, Price, Availability)
   - → View Tutor Detail Page → Send Booking Request (Modal) → Success Notification
   - → Return to Bookings Page (Pending Requests)

3. **Managing Bookings (Both Roles):**
   - Home Dashboard → Bookings Page
   - **Tutors see:** Pending Requests → Accept/Decline
   - **Students see:** Confirmed Sessions → Join Video Session → Floating Video Window
   - **Both see:** Completed Sessions → Write Review (Students) / View Reviews (Tutors)

4. **Attending Video Session:**
   - Bookings Page → Confirmed Sessions → Join Video Session
   - → Full-screen video room OR Minimize to Floating Window
   - → Continue browsing platform while in session

5. **Profile Management:**
   - Home Dashboard → Profile Settings
   - **Students:** Edit Profile (bio, subjects of interest, year of study)
   - **Tutors:** Manage Tutor Profile (subjects, hourly rate) + Manage Slots (availability calendar)

6. **AI Recommendations:**
   - Home Dashboard → AI Chat Assistant
   - → Ask for tutor recommendations → Get Personalized Suggestions
   - → Click recommended tutor → View Tutor Detail Page → Send Booking Request

**Key Navigation Features:**

- **Persistent Navigation Bar**: Always accessible from any page (Dashboard, Search, Bookings, Profile, AI Chat, Logout)
- **Breadcrumb Navigation**: Shows current location (e.g., Home > Search > Tutor Detail)
- **Quick Actions**: Dashboard provides shortcuts to frequent actions (Find Tutor, View Bookings, Check AI Recommendations)
- **Back Button Support**: All pages support browser back navigation
- **Notification Center**: Accessible from top bar; shows booking requests, confirmations, session reminders, new reviews

**Page Hierarchy:**

```
Home Dashboard
├── Search Tutors
│   ├── Filter Results
│   └── Tutor Detail Page
│       └── Booking Request Modal
├── Bookings
│   ├── Pending Requests (Tutor: Accept/Decline)
│   ├── Confirmed Sessions (Join Video)
│   └── Completed Sessions (Write Review)
├── Profile Settings
│   ├── Edit User Profile
│   ├── Manage Tutor Profile (Tutors only)
│   └── Manage Availability (Tutors only)
├── AI Chat Assistant
│   └── Recommendations View
└── Logout → End
```

---

**文档完成！** ✅

Tu2tor项目Part 1完整文档包含：
- ✅ Problem Definition/Customer Needs (4%) - 4个核心问题 + **Evidence-Based Analysis**
- ✅ Research Evidence - 6个研究引用 + 统计表格 + 可视化图表
- ✅ User Stories (8个详细故事) - 含Credit System创新理念
- ✅ Need and Demand Research (基于真实统计数据)
- ✅ Project Objectives (3%) - Purpose, Goals, and Value Proposition
- ✅ Proposed Features (3%) - 23个详细功能（含实时协作代码编辑器）
- ✅ Data Modeling (5%) - 6个核心数据模型 + ERD + 逻辑设计
- ✅ Wireframe (5%) - Use Case Diagram + User Navigation Flow

**准备用于学术报告和演示！**

