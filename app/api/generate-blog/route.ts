// // app/api/generate-blog/route.ts
// import type { NextRequest } from "next/server";
// import { createClient } from "@sanity/client";
// // import { Configuration, OpenAIApi } from "openai";
// import OpenAI from "openai";
// import crypto from "crypto";
// import fs from "fs";
// import path from "path";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";
// export const maxDuration = 60;

// // ======= Sanity Setup =======
// const sanity = createClient({
//   projectId: process.env.SANITY_PROJECT_ID!,
//   dataset: process.env.SANITY_DATASET!,
//   apiVersion: "2023-10-01",
//   token: process.env.SANITY_API_TOKEN,
//   useCdn: false,
// });

// // ======= OpenAI Setup =======
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // ======= Types =======
// interface BlogSection {
//   heading: string;
//   text: string;
// }

// interface GeneratedBlog {
//   title: string;
//   sections: BlogSection[];
//   tags: string[];
//   skillType?: "copywriter" | "audio" | "tutor";
// }

// interface PortableTextChild {
//   _type: "span";
//   text: string;
//   marks: string[];
// }

// interface PortableTextBlock {
//   _type: "block";
//   _key: string;
//   style: string;
//   markDefs: unknown[];
//   children: PortableTextChild[];
// }

// // ===== Helpers =======
// const slugify = (s: string) =>
//   s
//     .toLowerCase()
//     .replace(/[^\w\s-]/g, "")
//     .trim()
//     .replace(/\s+/g, "-")
//     .slice(0, 96);

// // ======= Main Handler =======
// export async function GET(_req: NextRequest) {
//   try {
//     // Upload a default image
//     const imagePath = path.join(process.cwd(), "public", "blog.jpg");
//     const fileBuffer = fs.readFileSync(imagePath);
//     const uploadedImage = await sanity.assets.upload("image", fileBuffer, {
//       filename: "blog.jpg",
//     });

//     // Randomly pick a skill type
//     const skillTypes: ("copywriter" | "audio" | "tutor")[] = ["copywriter", "audio", "tutor"];
//     const chosenSkill = skillTypes[Math.floor(Math.random() * skillTypes.length)];

//     // Random theme for variety 
//     const themes = ["psychology", "storytelling", "productivity", "future trends", "AI influence", "case studies"];
//     const chosenTheme = themes[Math.floor(Math.random() * themes.length)];

//     // Fetch existing titles to avoid repetition
//     const existing: { title: string }[] = await sanity.fetch(`*[_type == "blogPost" && defined(publishedAt)] | order(publishedAt desc){ title }`);
//     const prevTitle = existing.map(t => t.title);

//     // Fetch last two skill types to avoid repetition
//     const existingSkills: { skillType: "copywriter" | "audio" | "tutor" }[] =
//       await sanity.fetch(`*[_type == "blogPost" && defined(publishedAt)] | order(publishedAt desc)[0..1]{ skillType }`);
//     const lastTwo = existingSkills.map(s => s.skillType);

//     // ====== Prompt for OpenAI =====
//     const prompt = `
//       You are Kane "Jacob Frost" himself, writing blog posts for your own website. Write in your authentic style: conversational, direct, persuasive, and human—like you're chatting with a friend over coffee, but with authority from your expertise. Use casual language (e.g., "You ever...", "Let’s break it down", "Boom!", "Pro tip:"), rhetorical questions, emojis in headings for flair, a mix of psychology insights (e.g., FOMO, social proof, emotional triggers), practical advice, relatable scenarios, and playful touches. Keep it approachable, scannable, with short paragraphs, bold emphasis where needed, and a sense of empathy. Always sound genuine, warm, and non-corporate—avoid sterile or generic tones.
// Infuse your personal voice throughout: Refer to yourself as "I" (e.g., "When I work with clients...", "I’ve seen this a ton..."), share quick anecdotes or examples from your experience, and tie everything back to helping readers solve real problems. Promote your brand subtly but consistently: Position yourself as the expert in copywriting, audio engineering, or English tutoring, and end with a strong, low-pressure CTA offering free value (e.g., discovery chat, audit, or call) via your email kane@jacobfrost.com.au or DM. Sign off with "Kane ‘Jacob Frost’ ✌🏼" in the CTA.
// Ensure the blog is clearly focused on "${chosenSkill}" (NOT the other topics).
// Topic: ${chosenSkill}
// Extra twist: Write this blog through the lens of "${chosenTheme}".
// Also the title and content must be different from any previous blogs in the database. and the title must be different than ${prevTitle}
// The skillType must also be different than the last two blogs, which were ${lastTwo}.
// means the skill type of blogs must be rotated, for e.g. if last one is copywriter, this one must be either audio or tutor. or if last one is audio, this one must be either copywriter or tutor or if last one is tutor, this one must be either copywriter or audio.
// Generate a blog post in JSON format.
// Fields:

// title (catchy, clear, curiosity-driven, like a YouTube thumbnail—e.g., "How to [Problem] Without [Common Mistake] in 2025")
// skillType ("copywriter", "audio", or "tutor")
// intro (2-4 engaging paragraphs hooking the reader with a relatable scenario, problem, or question; set the stage, explain why it matters, and tease the solutions—make it personal and conversational)
// sections (array of 5-8 items, starting after the intro). Each has:

// heading (unique, varied, starts with different emojis each time; e.g., 🧠 for psychology, 🎯 for why it matters, 🧱 for structure, 💡 for tips, 🚫 for mistakes, 📣 for wrap-up—avoid repeats or minor tweaks)
// text (3–6 short paragraphs per section; use examples, ❌ vs ✅ comparisons, practical tips, analogies, and tie in psychology where it fits. Keep it scannable with bullets, numbered lists, or bolded points when helpful.)


// tags (5–10 SEO-friendly tags, including keywords like "copywriting tips", "audio mixing secrets", "English fluency hacks", plus general ones like "psychology in marketing", "language learning strategies")
// cta (a friendly, persuasive call-to-action paragraph at the end; offer free help tied to the topic, invite contact via DM or email kane@jacobfrost.com.au, include a link if relevant like "book a call here", and sign off with "Kane ‘Jacob Frost’ ✌🏼")

// Return ONLY JSON. Example:
// {
//         "title": "How to Stop Translating in Your Head When Speaking a Foreign Language",
//         "skillType": "tutor",
//         "intro": "Struggling to speak fluently without mentally translating every word? Learn how to train your brain to think in your target language—and speak with confidence and flow.
//         Struggling to speak fluently without mentally translating every word? Learn how to train your brain to think in your target language—and speak with confidence and flow.

// -

// You’re in the middle of a conversation. You know the words. You know what you want to say. But your brain’s doing a weird dance: thinking in your native language… translating… second-guessing… and then finally speaking (slowly).

// It’s exhausting. And frustrating.

// In this article, we’re going to break down exactly why your brain translates by default, and more importantly, how to train it to think in the target language instead—so you can speak more fluently, naturally, and confidently. ...",
//         "sections": [
//           {"heading1": "❓Why Do We Translate in Our Heads?", "text": "Short answer: because your brain’s just doing what it knows best.

// When you're learning a new language, your brain doesn’t have all the structures built yet. So it leans on your native language as a reference point—a bridge. It finds the words you want to say, then tries to reconstruct them in your second language.

// At first, this makes sense. It’s a survival tool. But after a certain point, this habit slows you down, and becomes a barrier to real fluency.

// 🧠 Think of it like this:

// Translating mid-sentence is like trying to play piano while reading a sheet of music written in another language. Technically possible, but… clunky."},
//           {"heading": "🐢 Why Translating Hurts Fluency", "text": "Let’s break it down.

// When you translate in your head:

// You speak more slowly
// You lose confidence mid-sentence
// Your grammar often comes out wrong (because you're translating structure, not just words)
// You freeze when a word doesn’t exist in your native language (or has no direct equivalent)
// Worst of all? You’re using too much mental energy. In real conversation, you don’t have time to pause and think through every sentence like a math problem. That pressure builds hesitation… and kills flow.

// The goal is to move from thinking in Language A + converting → to thinking directly in Language B.

// Let’s talk about how to make that happen...."},
//           {"heading": "✅ How to Train Your Brain to Think in a Foreign Language", "text": "This is where the fun starts. Below are six science-backed and experience-proven methods to reprogram your brain and ditch the internal translator.

// 🟩 1. Start with Words You Already Know
// You don’t need full sentences to begin thinking in your target language. Start by swapping in familiar words throughout your day.

// Examples:

// “Water”
// “Hungry”
// “Phone”
// “Left, right, straight”
// “Sleepy. Tired. Happy.”
// Build tiny associations—thought → word.

// The more often you access that word in context, the faster it becomes your brain’s default.

// 🟩 2. Narrate Your Life (Out Loud or Internally)
// Yes, you might feel a bit silly. But this trick is powerful.

// Simply describe what you’re doing in real time, either out loud (if you’re alone) or in your head. You’re literally rewiring your brain to form ideas directly in the new language.

// Examples:

// “I’m making coffee.”
// “I forgot my keys again.”
// “I’m walking to the store. It’s hot today.”
// Over time, this will feel more natural—and less like a performance.

// 🟩 3. Use Flashcards Without Your Native Language
// If you’re using flashcards with your native language on one side and the new word on the other—stop.

// Instead, use:

// Images
// Contextual prompts
// Fill-in-the-blank style cards
// Full sentences as examples
// You want to build a direct link between the new word and its meaning, not its translation.

// Tools like Anki or Quizlet let you build custom decks with images or sentence-level cues.

// 🟩 4. Journal or Record Voice Notes in the Target Language
// Output = fluency fuel.

// Writing or speaking daily in your target language helps you slowly organise your thoughts, without pressure.

// Start small:

// 2–3 sentences about your day
// What you’re planning to do tomorrow
// A short “thank you” message to a fake friend
// Bonus: Record yourself on your phone and listen back a week later. You’ll hear your growth—and build confidence.

// 🟩 5. Learn Phrases and Chunks (Not Just Words)
// Single vocab words are great—but fluency comes from automatic phrases that just roll off your tongue.

// Instead of memorising:

// “go” + “to” + “the” + “gym”
// Learn the whole chunk:

// “I’m heading to the gym.”
// “I’ll be back in a bit.”
// “I’m just looking, thanks.”
// This method builds natural rhythm and sentence structure—no more mentally building sentences piece by piece.

// 🟩 6. Speak with Someone Who Matches Your Level
// Having a real conversation partner is key. But not just anyone—you want someone who will:

// Match your pace
// Speak clearly and slowly
// Correct you gently
// Encourage you to express yourself freely
// This is where a professional tutor makes a massive difference. A good tutor won’t just “drill” you—they’ll create space for genuine, level-appropriate expression, and gently push you out of translation mode."},
//           {"heading": "⚠️ Avoid These Translation Traps", "text": "Let’s be honest—sometimes we’re our own worst enemy. If you’re stuck in translation mode, check if you’re doing any of these:

// ❌ Looking up every single word
// Try to guess meaning from context before diving into the dictionary. It’s okay to not understand everything right away. Your brain will often fill the gaps naturally.

// ❌ Using Google Translate to write full sentences
// It’s tempting—but dangerous. You don’t learn anything that way. Instead, try to build the sentence yourself. If you’re stuck, then check and compare.

// ❌ Learning grammar rules in your native language
// Try learning grammar through examples and repetition, not memorising textbook-style explanations in your first language. Example: Don’t learn “present perfect tense = have + past participle.” Instead, absorb it from examples: “I’ve seen that movie.” / “She’s just left.”"},
//           {"heading": "🕒 How Long Does It Take to Think in Another Language?", "text": "Short answer: not as long as you think.

// With daily practice (15–30 mins of active output), most learners can start thinking in simple phrases within a few weeks. Full sentence fluency takes longer, but the shift happens gradually.

// It’s not about “being fluent.” It’s about making progress visible and breaking the dependency on your native language.

// Give yourself permission to start messy—and improve over time."},
// {"heading": "🧠 Final Thoughts: You’re Closer Than You Think", "text": "The transition from translating to thinking in a language is one of the most liberating feelings in the world. It’s where fluency really starts to take root.

// And the best part? You don’t need to wait until you “know more.” You can start today. Right now.

// Use the techniques above, stay consistent, and be kind to yourself when you stumble. You’re not failing—you’re rewiring your brain to do something amazing."},
// {"heading": "📣 Wanna Learn English Without Overthinking?", "text": "Did you know: having a professional and certified tutor with experience learning languages can seriously speed up your language learning process?

// If you're interested in optimising your language learning and want to reach your goals ASAP, don't hesitate to reach out at kane@jacobfrost.com.au, or book a free call here to discuss your needs and goals.

// Let’s work together to train your brain for real fluency—without translation delays, stress, or guesswork."}
//         ],
//         "tags": ["audio engineering", "mixing tips", "music production", "psychology in sound", "home studio hacks"]
//       }
// Rules:

// DO NOT repeat titles, headings, phrases, metaphors, or examples from past generations or the example blogs provided.
// Use fresh, original hooks, analogies (e.g., compare to everyday life like driving or cooking), and content every time—think creatively.
// If skillType = "audio", focus on music/audio/production/mixing/mastering, with practical studio tips and psychological elements like how sound affects emotions.
// If skillType = "tutor", focus on English tutoring, language learning, study hacks, fluency building, with psychology of learning and real-world conversation tips.
// If skillType = "copywriter", focus on persuasion, marketing, copy that converts, website/sales copy, with psychology triggers like FOMO or social proof.
// Headings must be unique and varied (different structures, emojis, and wording—no recycling even slightly).
// Title must be catchy but DIFFERENT from previous attempts—curiosity-driven, benefit-oriented, and include year or timely hook if it fits.
// Each heading must start differently and use different emojis; vary section types (e.g., why it happens, how to fix, mistakes to avoid, pro tips, final thoughts).
// Incorporate SEO: Naturally weave keywords into title, headings, and text (e.g., "audio mixing techniques 2025", "improve English fluency fast").
// Always promote your brand: In intro/sections, mention your expertise casually; in CTA, tie back to your services as a copywriter/audio expert/tutor.
// Match the example blogs' tone exactly: Start with a problem scenario, use lists/numbering for advice, include ❌ for bad examples and ✅ for good, end with empowering wrap-up.
// Do not use em and en dashes; use hyphens, commas, and periods only.

// Here are some example blogs of Kane Jacob Frost to analyze for style, tone, structure, and voice (intro hook, personal insights, psychology ties, practical lists, mistakes sections, strong CTA)—mimic closely but DO NOT copy any titles, headings, phrases, examples, or content from them:
//     How to Make Your Website Pop with Engaging Copy (That Actually Converts)
// 6/27/2025
// How to Make Your Website Pop with Engaging Copy (That Actually Converts)
// Perhaps you’ve built a perfectly designed website for your business, but you’re not getting any traffic… Here are a few recommendations and solutions.


// You ever land on a website that looks chef’s kiss amazing—stunning visuals, slick animations, dreamy colour palette—but for some reason… it just doesn’t hit? You scroll through, read a few lines, and still don’t quite get what they do, how they’re different, or why you should care.

// That’s because while design grabs attention, it’s the copy—the words—that do the heavy lifting when it comes to building trust, making a connection, and getting someone to actually take action.

// In 2025, websites are everywhere. Standing out isn’t just about looking good—it’s about communicating clearly and persuasively. Let’s talk about how to make your website pop—not just visually, but emotionally and strategically—with copy that actually moves people.

// 🎯 Why Your Website Copy Matters More Than Ever in 2025
// People are skimming. Fast. Attention spans are microscopic.

// You’ve got maybe 5 seconds—max—to show a visitor that your website is worth staying on. If your copy doesn’t immediately connect, they're gone. Just like that.

// And it’s not just about attention anymore. It’s about connection. We’re living in a world saturated with templated content, AI-generated blurbs, and cookie-cutter websites. What breaks through the noise?

// Real, resonant, personality-filled copy that speaks directly to your audience’s problems, dreams, and values.

// 🔑 5 Keys to Engaging Website Copy That Pops & Converts
// 1. 🧲 Headline Hooks That Stop the Scroll
// The first line someone reads—usually your homepage headline or H1—is everything. It needs to instantly communicate what you do and why it matters to them.

// Too many websites say:

// “Welcome to My Website” 😴 “Creative Services for All Your Needs” 😐

// But this doesn’t help communicate what your service/product is or why your customer needs it.

// Try something like:

// “Helping Creatives Turn Their Ideas into Income” “Designs That Make People Click, Stay, and Buy”

// Both of these promise a desired outcome.

// It’s about benefits, not job titles. You're not introducing yourself—you’re hooking interest.

// 2. 🎁 Benefits > Features
// Most people don’t care about what you do. They care about what it does for them.

// Let’s say you’re a freelance designer. Instead of saying:

// “I design logos, brand kits, and marketing materials”

// Try:

// “I help growing brands look the part so they can charge more and sell faster.”

// See the shift? One is a list, the other is a promise. It offers a solution to the targeted audience’s problem (not making enough money).

// Your copy should constantly translate your features into benefits. Ask yourself:

// 3. 🗣️ Conversational Tone That Sounds Like You
// You’re not writing a corporate brochure in 2004. You’re not applying for a bank loan.

// Speak to your reader like a real human. Think of your website as the digital version of you at a networking event: confident, helpful, and true to your vibe.

// Use contractions (you’re, I’m, we’ve). Ask rhetorical questions. Break the fourth wall a bit.

// People don’t buy from brands—they buy from people. So let your voice show up and show out.

// Even if your brand is more formal or premium, you can still write with clarity and flow. Conversational ≠ unprofessional.

// 4. 🧭 Clear Navigation and a Guided Flow
// Good website copy doesn’t just sound good—it leads the reader through a journey as part of a strategic sales funnel.

// Every section of your site should be doing one of these four things:

// Building curiosity
// Creating trust
// Highlighting benefits
// Pointing to action
// And you should never leave people wondering “What now?”

// That means clear CTAs like:

// “Book a discovery call”
// “Download the guide”
// “Explore my services”
// “DM me on Instagram to chat”
// Make it easy. Make it obvious. Repeat it often.

// Pro tip: Add CTAs after each section, not just at the bottom of the page. People need reminders, especially when they’re vibing with what you’re saying.

// 5. 💬 Trust-Building Through Testimonials and Proof
// If you're saying “I’m great at what I do”, cool. But if someone else says it? Boom!—instant credibility.

// Social proof is one of the strongest persuasive forces online.Use testimonials from real clients, screenshots of messages, stats (like “80% increase in conversions”), or before/after copy examples.

// If you're newer and don't have much social proof yet, no stress—use storytelling instead:

// “After rewriting her homepage, one of my clients booked out her services for the next two months.”

// Trust isn’t built through fluff. It’s built through evidence.

// 🚫 Common Copy Mistakes That Kill Engagement
// Before we wrap up, let’s run through a few copy sins you’ll want to avoid (you might catch one or two on your own site 👀):

// ❌ Writing all about yourself
// If 90% of your homepage starts with “I…”, flip it. Lead with their problem and your solution.
// ❌ Paragraphs that look like novels
// Break things up. Use bullet points. Use spacing. Let people breathe while reading.
// ❌ Using passive, corporate lingo
// “We strive to deliver quality solutions in a timely manner”
// vs

// “We help you get results—fast.”
// ❌ No clear next step
// Don’t assume they’ll know what to do. Tell them.
// 🛠️ Tips for DIY Website Copy (If You’re Not Hiring Yet)
// Alright, if you’re doing this solo for now, here are a few things to help you improve instantly:

// Write for one person (your dream client—not “everyone”)
// Use the mirror test: After every line, ask “So what?” or “Who cares?”
// Read it out loud – if it sounds awkward, rewrite it
// Use tools like Hemingway or Grammarly to tighten your flow
// Test one CTA per page and keep it consistent
// But here’s the thing: if writing your own copy is draining your energy, taking up too much time, or just not hitting the way you want...

// That’s when it’s time to bring in a pro.

// 📣 Final Words: Your Website Copy Should Work as Hard as You Do
// You’ve put in time, love, and probably a bit of stress building your brand and crafting your site. But if your words aren’t converting visitors into leads, bookings, or buyers… what’s the point?

// Strong copy isn’t a luxury—it’s a growth tool.

// It connects. It persuades. It makes you unforgettable.

// If you're ready to stop guessing, stop rewriting, and start seeing real results—I'm here to help.

// 👉🏽 Let’s make your website sound as good as it looks.
// 📩 Email me at kane@jacobfrost.com for a free copy audit or discovery call. No pressure—just clarity, direction, and results.

// Alternatively, you can book a call with me here.

// Kane 'Jacob Frost' ✌🏼

// and:

// How to Stop Translating in Your Head When Speaking a Foreign Language
// 6/27/2025
// How to Stop Translating in Your Head When Speaking a Foreign Language
// Struggling to speak fluently without mentally translating every word? Learn how to train your brain to think in your target language—and speak with confidence and flow.

// -

// You’re in the middle of a conversation. You know the words. You know what you want to say. But your brain’s doing a weird dance: thinking in your native language… translating… second-guessing… and then finally speaking (slowly).

// It’s exhausting. And frustrating.

// In this article, we’re going to break down exactly why your brain translates by default, and more importantly, how to train it to think in the target language instead—so you can speak more fluently, naturally, and confidently.

// ❓Why Do We Translate in Our Heads?
// Short answer: because your brain’s just doing what it knows best.

// When you're learning a new language, your brain doesn’t have all the structures built yet. So it leans on your native language as a reference point—a bridge. It finds the words you want to say, then tries to reconstruct them in your second language.

// At first, this makes sense. It’s a survival tool. But after a certain point, this habit slows you down, and becomes a barrier to real fluency.

// 🧠 Think of it like this:

// Translating mid-sentence is like trying to play piano while reading a sheet of music written in another language. Technically possible, but… clunky.

// 🐢 Why Translating Hurts Fluency
// Let’s break it down.

// When you translate in your head:

// You speak more slowly
// You lose confidence mid-sentence
// Your grammar often comes out wrong (because you're translating structure, not just words)
// You freeze when a word doesn’t exist in your native language (or has no direct equivalent)
// Worst of all? You’re using too much mental energy. In real conversation, you don’t have time to pause and think through every sentence like a math problem. That pressure builds hesitation… and kills flow.

// The goal is to move from thinking in Language A + converting → to thinking directly in Language B.

// Let’s talk about how to make that happen.

// ✅ How to Train Your Brain to Think in a Foreign Language
// This is where the fun starts. Below are six science-backed and experience-proven methods to reprogram your brain and ditch the internal translator.

// 🟩 1. Start with Words You Already Know
// You don’t need full sentences to begin thinking in your target language. Start by swapping in familiar words throughout your day.

// Examples:

// “Water”
// “Hungry”
// “Phone”
// “Left, right, straight”
// “Sleepy. Tired. Happy.”
// Build tiny associations—thought → word.

// The more often you access that word in context, the faster it becomes your brain’s default.

// 🟩 2. Narrate Your Life (Out Loud or Internally)
// Yes, you might feel a bit silly. But this trick is powerful.

// Simply describe what you’re doing in real time, either out loud (if you’re alone) or in your head. You’re literally rewiring your brain to form ideas directly in the new language.

// Examples:

// “I’m making coffee.”
// “I forgot my keys again.”
// “I’m walking to the store. It’s hot today.”
// Over time, this will feel more natural—and less like a performance.

// 🟩 3. Use Flashcards Without Your Native Language
// If you’re using flashcards with your native language on one side and the new word on the other—stop.

// Instead, use:

// Images
// Contextual prompts
// Fill-in-the-blank style cards
// Full sentences as examples
// You want to build a direct link between the new word and its meaning, not its translation.

// Tools like Anki or Quizlet let you build custom decks with images or sentence-level cues.

// 🟩 4. Journal or Record Voice Notes in the Target Language
// Output = fluency fuel.

// Writing or speaking daily in your target language helps you slowly organise your thoughts, without pressure.

// Start small:

// 2–3 sentences about your day
// What you’re planning to do tomorrow
// A short “thank you” message to a fake friend
// Bonus: Record yourself on your phone and listen back a week later. You’ll hear your growth—and build confidence.

// 🟩 5. Learn Phrases and Chunks (Not Just Words)
// Single vocab words are great—but fluency comes from automatic phrases that just roll off your tongue.

// Instead of memorising:

// “go” + “to” + “the” + “gym”
// Learn the whole chunk:

// “I’m heading to the gym.”
// “I’ll be back in a bit.”
// “I’m just looking, thanks.”
// This method builds natural rhythm and sentence structure—no more mentally building sentences piece by piece.

// 🟩 6. Speak with Someone Who Matches Your Level
// Having a real conversation partner is key. But not just anyone—you want someone who will:

// Match your pace
// Speak clearly and slowly
// Correct you gently
// Encourage you to express yourself freely
// This is where a professional tutor makes a massive difference. A good tutor won’t just “drill” you—they’ll create space for genuine, level-appropriate expression, and gently push you out of translation mode.

// ⚠️ Avoid These Translation Traps
// Let’s be honest—sometimes we’re our own worst enemy. If you’re stuck in translation mode, check if you’re doing any of these:

// ❌ Looking up every single word
// Try to guess meaning from context before diving into the dictionary. It’s okay to not understand everything right away. Your brain will often fill the gaps naturally.

// ❌ Using Google Translate to write full sentences
// It’s tempting—but dangerous. You don’t learn anything that way. Instead, try to build the sentence yourself. If you’re stuck, then check and compare.

// ❌ Learning grammar rules in your native language
// Try learning grammar through examples and repetition, not memorising textbook-style explanations in your first language. Example: Don’t learn “present perfect tense = have + past participle.” Instead, absorb it from examples: “I’ve seen that movie.” / “She’s just left.”

// 🕒 How Long Does It Take to Think in Another Language?
// Short answer: not as long as you think.

// With daily practice (15–30 mins of active output), most learners can start thinking in simple phrases within a few weeks. Full sentence fluency takes longer, but the shift happens gradually.

// It’s not about “being fluent.” It’s about making progress visible and breaking the dependency on your native language.

// Give yourself permission to start messy—and improve over time.

// 🧠 Final Thoughts: You’re Closer Than You Think
// The transition from translating to thinking in a language is one of the most liberating feelings in the world. It’s where fluency really starts to take root.

// And the best part? You don’t need to wait until you “know more.” You can start today. Right now.

// Use the techniques above, stay consistent, and be kind to yourself when you stumble. You’re not failing—you’re rewiring your brain to do something amazing.

// 📣 Wanna Learn English Without Overthinking?
// Did you know: having a professional and certified tutor with experience learning languages can seriously speed up your language learning process?

// If you're interested in optimising your language learning and want to reach your goals ASAP, don't hesitate to reach out at kane@jacobfrost.com.au, or book a free call here to discuss your needs and goals.

// Let’s work together to train your brain for real fluency—without translation delays, stress, or guesswork.
//       `;

//     // ===== Generate blog with OpenAI =====
//     const response = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [{ role: "user", content: prompt }],
//       temperature: 0.8,
//     });

//     const rawText = response.choices[0]?.message?.content || "";
//     const match = rawText.match(/\{[\s\S]*\}/);
//     if (!match) throw new Error("No valid JSON found in model response");

//     const blog: GeneratedBlog = JSON.parse(match[0]);

//     console.log("✅ Generated blog:", blog);

//     // ===== Build portable text content =====
//     const content: PortableTextBlock[] = [];
//     for (const sec of blog.sections) {
//       content.push({
//         _type: "block",
//         _key: crypto.randomUUID(),
//         style: "h2",
//         markDefs: [],
//         children: [{ _type: "span", text: sec.heading, marks: [] }],
//       });
//       content.push({
//         _type: "block",
//         _key: crypto.randomUUID(),
//         style: "normal",
//         markDefs: [],
//         children: [{ _type: "span", text: sec.text, marks: [] }],
//       });
//     }

//     // ===== Upload to Sanity =====
//     const slug = slugify(blog.title);
//     const doc = await sanity.create({
//       _type: "blogPost",
//       title: blog.title,
//       slug: { _type: "slug", current: slug },
//       skillType: blog.skillType || chosenSkill,
//       mainImage: {
//         _type: "image",
//         asset: { _type: "reference", _ref: uploadedImage._id },
//       },
//       content,
//       publishedAt: new Date().toISOString(),
//     });

//     return new Response(
//       JSON.stringify({ ok: true, id: doc._id, slug, title: blog.title }),
//       { headers: { "Content-Type": "application/json" } }
//     );

//   } catch (err: unknown) {
//     let message = "Unknown error";
//     if (err instanceof Error) {
//       message = err.message;
//     }
//     console.error("❌ Blog generation failed:", message);
//     return new Response(
//       JSON.stringify({ ok: false, error: message }),
//       { status: 500 }
//     );
//   }
// }

// export const POST = GET;


// app/api/generate-blog/route.ts
import type { NextRequest } from "next/server";
import { createClient } from "@sanity/client";
import OpenAI from "openai";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import type { PortableTextMarkDefinition } from "@portabletext/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// ======= Sanity Setup =======
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID_B!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET_B!,
  apiVersion: "2023-10-01",
  token: process.env.SANITY_API_TOKEN_B,
  useCdn: false,
});

// ======= OpenAI Setup =======
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ======= Types =======
interface BlogSection {
  heading: string;
  text: string;
}

interface GeneratedBlog {
  intro: string,
  title: string;
  sections: BlogSection[];
  tags: string[];
  skillType?: "copywriter" | "audio" | "tutor";
  cta: string
}

interface PortableTextChild {
  _type: "span";
  text: string;
  marks: string[];
}

interface MyPortableTextBlock {
  _type: "block";
  _key: string;
  style: string;
  markDefs: { _key: string; _type: string; href?: string }[];
  children: PortableTextChild[];
}

// ===== Helpers =======
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 96);

// Parse text for bold (**bold**), italic (_italic_), and links ([text](url))
function parseTextToPortableText(
  text: string,
  markDefs: { _key: string; _type: string; href?: string }[]
): PortableTextChild[] {
  const children: PortableTextChild[] = [];
  const regex = /(\*\*(.*?)\*\*|_(.*?)_|(\[([^\]]+)\]\(([^)]+)\)))/g;
  let lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      children.push({ _type: "span", text: text.slice(lastIndex, match.index), marks: [] });
    }

    if (match[2]) {
      // bold
      children.push({ _type: "span", text: match[2], marks: ["strong"] });
    } else if (match[3]) {
      // italic
      children.push({ _type: "span", text: match[3], marks: ["em"] });
    } else if (match[5] && match[6]) {
      // link
      const key = crypto.randomUUID();
      markDefs.push({ _key: key, _type: "link", href: match[6] });
      children.push({ _type: "span", text: match[5], marks: [key] });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    children.push({ _type: "span", text: text.slice(lastIndex), marks: [] });
  }

  return children;
}

async function getPexelsImage(query: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
      {
        headers: { Authorization: process.env.PEXELS_API_KEY! },
      }
    );

    const data = await response.json();
    if (data.photos && data.photos.length > 0) {
      return data.photos[0].src.medium; // choose size: tiny, small, medium, large
    }
    return null;
  } catch (error) {
    console.error("Error fetching Pexels image:", error);
    return null;
  }
}


// ======= Main Handler =======
export async function GET(_req: NextRequest) {
  try {
    // // Upload a default image
    // const imagePath = path.join(process.cwd(), "public", "blog.jpg");
    // const fileBuffer = fs.readFileSync(imagePath);
    // const uploadedImage = await sanity.assets.upload("image", fileBuffer, {
    //   filename: "blog.jpg",
    // });

    // Randomly pick a skill type
    const skillTypes: ("copywriter" | "audio" | "tutor")[] = ["copywriter", "audio", "tutor"];
    const chosenSkill = skillTypes[Math.floor(Math.random() * skillTypes.length)];

    // Random theme for variety 
    const themes = [
      "psychology",
      "storytelling",
      "productivity",
      "future trends",
      "AI influence",
      "case studies",
      "self-discipline",
      "failure lessons",
      "success mindset",
      "business mistakes",
      "language learning",
      "copywriting secrets",
      "marketing psychology",
      "habits & consistency",
      "entrepreneurship",
      "confidence building",
      "motivation vs discipline",
      "growth mindset",
      "money & value",
      "decision making",
      "overcoming fear",
      "learning faster",
      "communication skills",
      "social media impact",
      "real-world lessons"
    ];
    const chosenTheme = themes[Math.floor(Math.random() * themes.length)];


    // Fetch existing titles
    const existing: { title: string }[] = await sanity.fetch(`*[_type == "blogPost" && defined(publishedAt)] | order(publishedAt desc){ title }`) || [];
    const prevTitle = existing.length ? existing.map(t => t.title).slice(-2) : [];

    // Fetch last two skill types
    const existingSkills: { skillType: "copywriter" | "audio" | "tutor" }[] =
      (await sanity.fetch(`*[_type == "blogPost" && defined(publishedAt)] | order(publishedAt desc)[0..1]{ skillType }`)) || [];
    const lastTwo = existingSkills.length ? existingSkills.map(s => s.skillType) : [];

    // ====== Prompt for OpenAI =====
 const prompt = `
You are Kane "Jacob Frost," writing a blog in your authentic style: conversational, playful, persuasive, and high-energy. Imagine you are talking to a student aged 16–22, explaining ideas in a relatable, friendly way. Use short paragraphs (max 3 sentences), rhetorical questions, casual language (e.g., "You ever…", "Boom!", "Pro tip:"), emojis in headings, and psychological or practical insights. Make it scannable with headings, bullet points, numbered lists, checklists, tables, and side notes.

🔥 Formatting rules:
- Headings with emojis (🎯, 🚀, 🤯, ✅, ❌, 🎧, etc.)
- Mix bullet points (•, ➡️, ✨), numbered lists (1️⃣, 2️⃣, 3️⃣), and mini comparisons (❌ vs ✅) within sections
- Include at least 2 different list or table styles per blog
- Bold and italicize key points
- Add short examples, analogies, or mini-stories where relevant
- Keep content visually engaging for UI/UX, breaking long text blocks

📄 Blog requirements:
- Title: catchy, curiosity-driven, unique (≠ ${prevTitle})
- Skill type rotates (≠ last two: ${lastTwo}) must be "${chosenSkill}"
- Intro: 2–3 short paras using ONE of these hooks (choose randomly):
  1. Ask a relatable question
  2. Present a short story or scenario
  3. Share an intriguing fact or statistic
  4. Highlight a common student problem and tease the solution
- Sections: 5–7 items, each with:
  - Unique emoji heading
  - 3–6 short paras
  - At least one list, table, or comparison
  - Optional mini example, tip, or side note
- Tags: 6–8 SEO-friendly keywords
- CTA: persuasive, friendly, playful, inviting readers to contact via DM/email kane@jacobfrost.com.au, signed off with "Kane ‘Jacob Frost’ ✌🏼"

⚡ Important rules:
- Use student-relevant examples (school, hobbies, gaming, daily life)
- Avoid repeating metaphors, phrases, or headings
- Make intros and sections varied and human-like
- Include bullet points for UI/UX clarity
- Mimic the style of these examples (concise, relatable, action-oriented, playful, human tone):
  - "What Makes Copy Convert? The Psychology Behind Words That Sell"
  - "How to Learn a Language Fast: What Actually Works (Backed by Science)"

Return ONLY JSON in this structure:
{
  "title": "Catchy curiosity title",
  "skillType": "copywriter | audio | tutor",
  "intro": "2–3 paras",
  "sections": [
    {"heading": "Emoji + creative heading", "text": "3–6 paras with examples, tips, lists, comparisons, psychology"},
    ...
  ],
  "tags": ["keyword1", "keyword2", ...],
  "cta": "Persuasive CTA with Kane branding + email kane@jacobfrost.com.au"
}
`;


    // console.log(prevTitle)
    console.log(lastTwo)
    console.log(chosenSkill)

    // ===== Generate blog with OpenAI =====
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const rawText = response.choices[0]?.message?.content || "";
    const match = rawText.match(/\{[\s\S]*\}/);

    if (!match) throw new Error("No valid JSON found in model response");

    // Replace unescaped newlines/tabs in strings
    const safeJson = match[0].replace(/\\n/g, "\\n").replace(/\\t/g, "\\t");

    let blog: GeneratedBlog;
    try {
      const match = rawText.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No valid JSON found");
      const safeJson = match[0].replace(/\\n/g, "\\n").replace(/\\t/g, "\\t");
      blog = JSON.parse(safeJson);
    } catch (err) {
      throw new Error("Failed to parse OpenAI response as JSON");
    }

    // Fetch a relevant image from Pexels based on blog title or theme
    const imageQuery = blog?.title || chosenTheme || "blog"; // fallback to theme if title undefined
    const pexelsImageUrl = await getPexelsImage(imageQuery);

    let uploadedImage;
    if (pexelsImageUrl) {
      // Fetch image buffer from URL
      const imageBuffer = await fetch(pexelsImageUrl).then(res => res.arrayBuffer());
      uploadedImage = await sanity.assets.upload("image", Buffer.from(imageBuffer), {
        filename: `${slugify(imageQuery)}.jpg`,
      });
    } else {
      // fallback to default local image
      const imagePath = path.join(process.cwd(), "public", "blog.jpg");
      const fileBuffer = fs.readFileSync(imagePath);
      uploadedImage = await sanity.assets.upload("image", fileBuffer, {
        filename: "blog.jpg",
      });
    }


    // console.log("✅ Generated blog:", blog);

    // ===== Build portable text content =====
    const content: MyPortableTextBlock[] = [];
    // Add intro (special block)
    if (blog.intro) {
      content.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: "normal",
        markDefs: [],
        children: [{ _type: "span", text: blog.intro, marks: [] }],
      });
    }

    // Add main sections
    for (const sec of blog.sections) {
      content.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: "h2",
        markDefs: [],
        children: [{ _type: "span", text: sec.heading, marks: [] }],
      });

      const markDefs: PortableTextMarkDefinition[] = [];
      content.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: "normal",
        markDefs,
        children: parseTextToPortableText(sec.text, markDefs),
      });
    }

    // Add CTA (special block)
    if (blog.cta) {
      content.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: "blockquote", // or "normal", depends on styling
        markDefs: [],
        children: [{ _type: "span", text: blog.cta, marks: [] }],
      });
    }


    // ===== Upload to Sanity =====
    const slug = slugify(blog.title);
    const doc = await sanity.create({
      _type: "blogPost",
      title: blog.title,
      slug: { _type: "slug", current: slug },
      skillType: blog.skillType || chosenSkill,
      mainImage: { _type: "image", asset: { _type: "reference", _ref: uploadedImage._id } },
      content,
      publishedAt: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ ok: true, id: doc._id, slug, title: blog.title }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;
    console.error("❌ Blog generation failed:", message);

    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500 }
    );
  }
}

export const POST = GET;
