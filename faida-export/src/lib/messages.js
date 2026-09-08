/**
 * Faida Bot Messages — English & Kiswahili
 * ──────────────────────────────────────────────────────────
 * All user-facing conversation strings for the WhatsApp bot.
 * Use getMessages(lang) to retrieve the correct language set.
 */

const MESSAGES_EN = {
  askLanguage: () =>
    `🌿 *Habari! Welcome to Faida.*\n\n` +
    `Faida is *completely free* and *confidential*. We help Kenyans find government grants, NGO support, and benefits they qualify for — in minutes.\n\n` +
    `We never sell your data. Your answers are only used to match you with benefits.\n\n` +
    `*Choose your language / Chagua lugha yako:*\n\n` +
    `*1* — English\n` +
    `*2* — Kiswahili`,

  welcome: () =>
    `🌿 *Welcome to Faida!*\n\n` +
    `Faida is *free* and *confidential*. I'll ask you 6 quick questions, then show you everything you may qualify for — with exact steps to apply.\n\n` +
    `Let's start! 👇\n\n` +
    `*How old are you?*\n` +
    `_(Type your age, e.g. 27 — or *0* if you don't know)_`,

  askGender: () =>
    `Got it! 👍\n\n` +
    `*What is your gender?*\n\n` +
    `Reply:\n` +
    `*1* — Male\n` +
    `*2* — Female\n` +
    `*0* — I don't know`,

  askCounty: () =>
    `*Which county are you in?*\n\n` +
    `_(Type your county, e.g. Nairobi, Kisumu — or *0* if you don't know)_`,

  askEmployment: () =>
    `*What is your current work situation?*\n\n` +
    `Reply:\n` +
    `*1* — I am employed (working for someone else)\n` +
    `*2* — I run my own business\n` +
    `*3* — I am looking for work / not employed\n` +
    `*0* — I don't know`,

  askDisability: () =>
    `*Do you have a disability?*\n\n` +
    `Reply:\n` +
    `*1* — Yes\n` +
    `*2* — No\n` +
    `*0* — I don't know / prefer not to say\n\n` +
    `_(Some benefits are specifically for persons with disabilities)_`,

  askCategories: () =>
    `Almost done! 🎉\n\n` +
    `*What kind of support are you looking for?*\n\n` +
    `Reply with one or more numbers separated by commas:\n\n` +
    `*1* — 💰 Financial (grants, loans, tenders)\n` +
    `*2* — 🏥 Health & Wellness\n` +
    `*3* — 💼 Employment & Training\n` +
    `*4* — ⚖️ Legal Services\n` +
    `*5* — 🏠 Housing\n` +
    `*6* — All of the above\n` +
    `*0* — I don't know (show me everything)`,

  noMatches: () =>
    `😔 We couldn't find matching benefits with your current profile.\n\n` +
    `This could change — we update our database regularly.\n\n` +
    `Try:\n` +
    `• *MENU* — restart and adjust your answers\n` +
    `• *RESULTS* — see your last matches\n` +
    `• *SHARE* — share Faida with someone`,

  shareMessage: () =>
    `Here's how to share Faida with someone:\n\n` +
    `📲 *Just send them this message:*\n\n` +
    `---\n` +
    `_Hey! I found a free service that helps Kenyans discover government grants and benefits they qualify for. It takes 2 minutes. Just WhatsApp this number and type "Hi" to get started._\n` +
    `---\n\n` +
    `💚 Every share helps more Kenyans access money that's already meant for them.`,

  menu: () =>
    `*Faida Main Menu* 🌿\n\n` +
    `*START* — Check your benefits again\n` +
    `*RESULTS* — See your last matches\n` +
    `*CHAT* — Ask the AI assistant about benefits\n` +
    `*OPPORTUNITIES* — Latest verified grants from the web\n` +
    `*NEAREST* — Find nearest office for your top benefit\n` +
    `*FEEDBACK* — Rate your experience\n` +
    `*REMINDERS ON* — Get deadline alerts\n` +
    `*SHARE* — Share Faida with someone\n` +
    `*HELP* — How Faida works\n\n` +
    `Or type a category: *FINANCIAL* · *HEALTH* · *EMPLOYMENT* · *LEGAL* · *HOUSING*`,

  help: () =>
    `*How Faida works* 🌿\n\n` +
    `1. You answer 6 quick questions about yourself\n` +
    `2. We check your answers against 30+ government and NGO programmes\n` +
    `3. We show you everything you qualify for — with exact steps to apply\n\n` +
    `*Is my information safe?*\n` +
    `Yes. Faida is free and confidential. We don't sell your data.\n\n` +
    `*Commands:* MENU · START · RESULTS · CHAT · OPPORTUNITIES · NEAREST · FEEDBACK · REMINDERS ON/OFF\n\n` +
    `Built by Munene · munene.dev`,

  aiWelcome: () =>
    `🤖 *Faida AI Assistant*\n\n` +
    `Ask me about grants, find verified opportunities, or get help filling forms.\n\n` +
    `• *FORM https://...* — fetch & fill a verified application page\n` +
    `• *PDF* — export your filled form for printing\n` +
    `• *SUBMIT* — submit on partner sites (where supported)\n\n` +
    `I only use verified official sources.\n\n` +
    `Type *MENU* anytime to exit chat.`,

  aiUnavailable: () =>
    `🤖 The AI assistant isn't available right now.\n\n` +
    `You can still:\n` +
    `• *START* — Find benefits that match your profile\n` +
    `• *OPPORTUNITIES* — See latest verified grants\n` +
    `• *MENU* — All options`,

  aiError: () =>
    `Sorry, something went wrong with the AI assistant. Please try again in a moment.\n\n` +
    `Type *MENU* for other options.`,

  opportunitiesRefreshed: (count) =>
    `✅ *Verified opportunities updated!*\n\n` +
    `Found *${count}* listing${count === 1 ? "" : "s"} from official sources.\n\n` +
    `Type *OPPORTUNITIES* to see them · *CHAT* to ask questions · *MENU* for more.`,

  formStartHelp: () =>
    `📋 *Form assistant*\n\nSend a verified link after FORM, for example:\n*FORM https://www.m-taji.co.ke/opportunities/...*`,

  formFetched: (title, fieldCount) =>
    `📋 *Form loaded:* ${title}\nFound *${fieldCount}* field${fieldCount === 1 ? "" : "s"}. I'll help you fill it.`,

  formCompleteHelp: () =>
    `✅ *Form complete!*\n\n` +
    `• *PDF* — download printable copy\n` +
    `• *SUBMIT* — submit on partner site (where supported)\n` +
    `• *MENU* — exit`,

  formFieldError: (msg) => `⚠️ ${msg}\n\nPlease try again.`,

  formNoActive: () => `No active form. Use *FORM https://...* or ask in *CHAT*.`,

  formPdfReady: (ref) => `📄 *PDF ready!* Reference: *${ref}*\n\nAttached for printing.`,

  formFetchFailed: () =>
    `Could not load that page. Use a verified link (.go.ke, m-taji.co.ke, etc.) or try again later.`,

  formError: () => `Something went wrong with the form assistant. Type *MENU* to continue.`,

  rateLimited: () =>
    `⏳ You're sending messages very quickly!\n\n` +
    `Please wait a moment before sending more. Faida is here to help — take your time. 😊`,

  voiceMessage: () =>
    `🎤 I received your voice message, but I can only read typed text right now.\n\n` +
    `Please type your reply instead. If you need help, type *HELP*.`,

  noPreviousResults: () =>
    `You don't have any previous results yet.\n\n` +
    `Type *START* to answer the questions and find your benefits.`,

  feedbackPrompt: () =>
    `*We'd love your feedback!* ⭐\n\n` +
    `On a scale of 1–5, how was your experience with Faida?\n\n` +
    `*1* — Poor\n` +
    `*2* — Fair\n` +
    `*3* — Good\n` +
    `*4* — Very good\n` +
    `*5* — Excellent`,

  feedbackComment: () =>
    `Thank you! 🙏\n\n` +
    `Any short comment to help us improve? (Optional)\n\n` +
    `Type your comment, or *SKIP* to finish.`,

  feedbackThanks: (rating) =>
    `✅ Thank you for your feedback (${rating}/5)!\n\n` +
    `Your input helps us improve Faida for all Kenyans.\n\n` +
    `Reply *MENU* for more options.`,

  nearestPrompt: () =>
    `📍 *Find the nearest office*\n\n` +
    `Type your town or area (e.g. *Westlands*, *Kisumu CBD*, *Mombasa Old Town*).\n\n` +
    `Or type *0* to use your county from your profile.`,

  nearestNoMatches: () =>
    `You need to complete the questionnaire first to find the nearest office.\n\n` +
    `Type *START* to begin.`,

  invalidAge: () => `Please enter a valid age (e.g. *25*), or *0* if you don't know.`,
  invalidGender: () => `Please reply *1* for Male, *2* for Female, or *0* if you don't know.`,
  invalidCounty: () => `Please type your county (e.g. *Nairobi*), or *0* if you don't know.`,
  invalidEmployment: () =>
    `Please reply:\n*1* — Employed\n*2* — Own business\n*3* — Looking for work\n*0* — I don't know`,
  invalidDisability: () => `Please reply *1* for Yes, *2* for No, or *0* if you don't know.`,
  invalidCategories: (askCategories) =>
    `Please reply with numbers like *1*, *1,3*, *6* for all, or *0* if unsure.\n\n${askCategories()}`,
  invalidFeedbackRating: () => `Please reply with a number from *1* to *5*.`,
  invalidDetail: (num) =>
    `Hmm, I don't have a benefit #${num} in your last results. Reply *MENU* or *RESULTS*.`,

  resultsHeader: (total) =>
    `✅ *Great news! We found ${total} benefit${total > 1 ? "s" : ""} you may qualify for:*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n`,

  resultsFooter: () =>
    `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
    `💡 Reply *D1*, *D2*, etc. for full application steps.\n` +
    `Reply *NEAREST* for the nearest office · *MENU* for more options.`,

  detailFooter: () =>
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `Reply *MENU* to check other benefits\n` +
    `Reply *NEAREST* to find the nearest office\n` +
    `Reply *SHARE* to share Faida with someone`,

  cardReason: (reasons) =>
    reasons.length > 0 ? `\n_Why you qualify: ${reasons.join(", ")}_` : "",

  cardApply: (index) => `Reply *D${index}* to see how to apply`,

  detailLabels: {
    whatYouGet: "What you get:",
    about: "About this benefit:",
    howToApply: "How to apply:",
    documents: "Documents you need:",
    deadline: "Deadline:",
    link: "Official link:",
  },

  unknownInput: () =>
    `I didn't understand that. 🤔\n\n` +
    `Try:\n` +
    `• *D1*, *D2*... for application steps\n` +
    `• *RESULTS* to see your matches again\n` +
    `• *START* to check benefits again\n` +
    `• *MENU* for all options`,

  invalidLanguage: () => `Please reply *1* for English or *2* for Kiswahili.`,

  remindersOn: () =>
    `✅ *Deadline reminders turned ON*\n\n` +
    `We'll message you at 8am Nairobi time when a benefit you matched has a deadline within 7 days.\n\n` +
    `Reply *REMINDERS OFF* anytime to stop.`,

  remindersOff: () =>
    `🔕 *Deadline reminders turned OFF*\n\n` +
    `You won't receive deadline alerts anymore.\n\n` +
    `Reply *REMINDERS ON* when you want them again.`,

  resultsHeader: (total) =>
    `✅ *Great news! We found ${total} benefit${total > 1 ? "s" : ""} you may qualify for:*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n`,

  resultsFooter: () =>
    `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
    `💡 Reply *D1*, *D2*, etc. for full application steps.\n` +
    `Reply *NEAREST* for the nearest office · *MENU* for more options.`,

  resultActionsMenu: (benefitName, matchIndex) =>
    `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
    `📌 *${benefitName}* — Next steps:\n\n` +
    `*A* — 📝 Apply now (I'll help you fill the form)\n` +
    `*B* — 📄 See full details and apply yourself\n` +
    `*C* — 💾 Save this and check other benefits`,

  applyNowIntro: (benefitName, estMinutes, fieldCount) =>
    `✅ Great! Let's fill your *${benefitName}* application together.\n\n` +
    `This takes about *${estMinutes} minutes* (${fieldCount} questions).\n\n` +
    `Type *BACK* to go to the previous question\n` +
    `Type *CANCEL* anytime to stop and save your progress\n\n` +
    `Let's start! 👇`,

  applyFieldQuestion: (label, placeholder, fieldNum, totalFields) =>
    `*${fieldNum}/${totalFields}* — ${label}` +
    (placeholder ? `\n_(${placeholder})_` : ""),

  applyFieldError: (errorMsg) =>
    `⚠️ ${errorMsg}\n\nPlease try again, or type *BACK* / *CANCEL*.`,

  applyCancelled: (resumeIndex) =>
    `✅ Application saved. We've kept all your answers.\n\n` +
    `Reply *APPLY${resumeIndex ? ` ${resumeIndex}` : ""}* to resume this benefit, or *MENU* for more.`,

  applyCompleteHeader: (benefitName, refCode) =>
    `🎉 *Application Ready!*\n\n` +
    `Thank you for completing your *${benefitName}* application.\n\n` +
    `Your reference code: *${refCode}*\n` +
    `Save this code — you'll need it at the office.\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n`,

  applyCompleteDocumentInfo: () =>
    `📋 *Pre-filled Application Form*\n` +
    `(Keep reading — this is your form. Screenshot or copy it!)\n\n`,

  applyCompleteNextStepsOffice: (officeName, address, phone, hours) =>
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📍 *Next Step: Visit this office to submit:*\n\n` +
    `*${officeName}*\n` +
    `${address}\n` +
    `🕐 ${hours}\n` +
    `📞 ${phone}\n\n`,

  applyCompleteNextStepsMobile: (dialCode, website) =>
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📱 *Next Step: Apply on your phone:*\n\n` +
    `Dial *${dialCode}* on your phone, OR\n` +
    `Visit: ${website}\n\n` +
    `Your answers above are ready to enter.`,

  applyCompleteFooter: () =>
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `Reply *MENU* to check other benefits\n` +
    `Reply *RESULTS* to see all your matches\n` +
    `Reply *NEAREST* for the closest office`,

  applyResume: () =>
    `⏯️ Resuming your in-progress application...\n\n`,

  applyResumeBenefit: (benefitName, answersCount) =>
    `You have a partially-filled *${benefitName}* application (${answersCount} answers saved).\n\n` +
    `Reply *1* — Continue where you left off\n` +
    `Reply *2* — Start fresh\n` +
    `Reply *CANCEL* — Back to menu`,

  invalidApplyAction: () =>
    `Reply *A*, *B*, or *C* to choose your next step.\n\n` +
    `*A* — Apply together\n*B* — Full details\n*C* — Other benefits`,

  invalidApplyCommand: () =>
    `If you want to resume a saved application, reply *APPLY* followed by the benefit number (e.g. *APPLY 1*).\n\nOr *MENU* for options.`,
};

const MESSAGES_SW = {
  askLanguage: MESSAGES_EN.askLanguage,

  welcome: () =>
    `🌿 *Karibu Faida!*\n\n` +
    `Faida ni *bure kabisa* na *siri*. Nitauliza maswali 6 mafupi, kisha nitaonyesha fursa zote unazostahili — pamoja na hatua za kuomba.\n\n` +
    `Tuanze! 👇\n\n` +
    `*Una umri gani?*\n` +
    `_(Andika umri wako, mfano 27 — au *0* ikiwa hujui)_`,

  askGender: () =>
    `Sawa! 👍\n\n` +
    `*Jinsia yako ni ipi?*\n\n` +
    `Jibu:\n` +
    `*1* — Mwanaume\n` +
    `*2* — Mwanamke\n` +
    `*0* — Sijui`,

  askCounty: () =>
    `*Uko kaunti gani?*\n\n` +
    `_(Andika jina la kaunti, mfano Nairobi, Kisumu — au *0* ikiwa hujui)_`,

  askEmployment: () =>
    `*Hali yako ya kazi ni ipi?*\n\n` +
    `Jibu:\n` +
    `*1* — Ninaajiriwa (nafanya kazi kwa mtu mwingine)\n` +
    `*2* — Nina biashara yangu\n` +
    `*3* — Ninatafuta kazi / sina kazi\n` +
    `*0* — Sijui`,

  askDisability: () =>
    `*Una ulemavu?*\n\n` +
    `Jibu:\n` +
    `*1* — Ndiyo\n` +
    `*2* — Hapana\n` +
    `*0* — Sijui / sipendi kusema\n\n` +
    `_(Baadhi ya fursa ni maalum kwa watu wenye ulemavu)_`,

  askCategories: () =>
    `Karibu kumaliza! 🎉\n\n` +
    `*Unatafuta msaada wa aina gani?*\n\n` +
    `Jibu na nambari moja au zaidi zikitenganishwa na koma:\n\n` +
    `*1* — 💰 Fedha ( ruzuku, mikopo, zabuni)\n` +
    `*2* — 🏥 Afya na Ustawi\n` +
    `*3* — 💼 Ajira na Mafunzo\n` +
    `*4* — ⚖️ Huduma za Kisheria\n` +
    `*5* — 🏠 Nyumba\n` +
    `*6* — Zote hapo juu\n` +
    `*0* — Sijui (onyesha kila kitu)`,

  noMatches: () =>
    `😔 Hatukupata fursa zinazolingana na wasifu wako.\n\n` +
    `Hali hii inaweza kubadilika — tunasasisha hifadhidata yetu mara kwa mara.\n\n` +
    `Jaribu:\n` +
    `• *MENU* — anza upya\n` +
    `• *RESULTS* — angalia matokeo yako ya mwisho\n` +
    `• *SHARE* — shiriki Faida na mtu mwingine`,

  shareMessage: () =>
    `Hivi ndivyo unavyoweza kushiriki Faida:\n\n` +
    `📲 *Mtumie mtu ujumbe huu:*\n\n` +
    `---\n` +
    `_Habari! Nimepata huduma bure inayosaidia Wakenya kupata ruzuku na fursa za serikali. Inachukua dakika 2. Wasiliana na nambari hii na andika "Hi" kuanza._\n` +
    `---\n\n` +
    `💚 Kila ushiriki unasaidia Wakenya zaidi kupata pesa zilizowekewa tayari.`,

  menu: () =>
    `*Menyu Kuu ya Faida* 🌿\n\n` +
    `*START* — Angalia fursa zako tena\n` +
    `*RESULTS* — Angalia matokeo yako ya mwisho\n` +
    `*CHAT* — Uliza msaidizi wa AI kuhusu fursa\n` +
    `*OPPORTUNITIES* — Fursa mpya kutoka vyanzo vilivyothibitishwa\n` +
    `*NEAREST* — Tafuta ofisi iliyo karibu\n` +
    `*FEEDBACK* — Kadiria uzoefu wako\n` +
    `*REMINDERS ON* — Pata kumbusho la muda wa mwisho\n` +
    `*SHARE* — Shiriki Faida\n` +
    `*HELP* — Faida inavyofanya kazi\n\n` +
    `Au andika kategoria: *FINANCIAL* · *HEALTH* · *EMPLOYMENT* · *LEGAL* · *HOUSING*`,

  help: () =>
    `*Faida inavyofanya kazi* 🌿\n\n` +
    `1. Unajibu maswali 6 mafupi kukuhusu\n` +
    `2. Tunalinganisha majibu yako na programu 30+ za serikali na NGO\n` +
    `3. Tunakuonyesha kila unachostahili — pamoja na hatua za kuomba\n\n` +
    `*Taarifa zangu ziko salama?*\n` +
    `Ndiyo. Faida ni bure na siri. Hatuuzi data yako.\n\n` +
    `*Amri:* MENU · START · RESULTS · CHAT · OPPORTUNITIES · NEAREST · FEEDBACK · REMINDERS ON/OFF\n\n` +
    `Imetengenezwa na Munene · munene.dev`,

  aiWelcome: () =>
    `🤖 *Msaidizi wa AI wa Faida*\n\n` +
    `Niulize kuhusu ruzuku, tafuta fursa zilizothibitishwa, au nikusaidie kujaza fomu.\n\n` +
    `• *FORM https://...* — pakua na jaza fomu kutoka tovuti rasmi\n` +
    `• *PDF* — pakua nakala ya kuchapisha\n` +
    `• *SUBMIT* — wasilisha kwenye tovuti za washirika\n\n` +
    `Ninatumi tu vyanzo vilivyothibitishwa.\n\n` +
    `Andika *MENU* wakati wowote kutoka.`,

  formStartHelp: () =>
    `📋 *Msaidizi wa fomu*\n\nTuma kiungo kilichothibitishwa baada ya FORM, mfano:\n*FORM https://www.m-taji.co.ke/opportunities/...*`,

  formFetched: (title, fieldCount) =>
    `📋 *Fomu imepakuliwa:* ${title}\nImepata sehemu *${fieldCount}*. Nitakusaidia kujaza.`,

  formCompleteHelp: () =>
    `✅ *Fomu imekamilika!*\n\n` +
    `• *PDF* — pakua nakala ya kuchapisha\n` +
    `• *SUBMIT* — wasilisha kwenye tovuti ya mshirika\n` +
    `• *MENU* — toka`,

  formFieldError: (msg) => `⚠️ ${msg}\n\nJaribu tena.`,

  formNoActive: () => `Hakuna fomu hai. Tumia *FORM https://...* au uliza kwenye *CHAT*.`,

  formPdfReady: (ref) => `📄 *PDF iko tayari!* Msimbo: *${ref}*\n\nImeambatishwa kwa ajili ya kuchapisha.`,

  formFetchFailed: () =>
    `Imeshindwa kupakia ukurasa huo. Tumia kiungo kilichothibitishwa (.go.ke, m-taji.co.ke, nk.)`,

  formError: () => `Kuna tatizo na msaidizi wa fomu. Andika *MENU* kuendelea.`,

  aiUnavailable: () =>
    `🤖 Msaidizi wa AI haupatikani kwa sasa.\n\n` +
    `Bado unaweza:\n` +
    `• *START* — Tafuta fursa zinazokufaa\n` +
    `• *OPPORTUNITIES* — Angalia ruzuku mpya zilizothibitishwa\n` +
    `• *MENU* — Chaguo zote`,

  aiError: () =>
    `Samahani, kuna tatizo na msaidizi wa AI. Jaribu tena baadaye.\n\n` +
    `Andika *MENU* kwa chaguo zingine.`,

  opportunitiesRefreshed: (count) =>
    `✅ *Fursa zilizothibitishwa zimesasishwa!*\n\n` +
    `Tumepata *${count}* tangazo${count === 1 ? "" : " la"} kutoka vyanzo rasmi.\n\n` +
    `Andika *OPPORTUNITIES* kuona · *CHAT* kuuliza · *MENU* kwa zaidi.`,

  rateLimited: () =>
    `⏳ Unatumia ujumbe kwa haraka sana!\n\n` +
    `Tafadhali subiri kidogo kabla ya kutuma zaidi. Faida iko hapa kukusaidia. 😊`,

  voiceMessage: () =>
    `🎤 Nimepokea ujumbe wako wa sauti, lakini kwa sasa naelewa maandishi tu.\n\n` +
    `Tafadhali andika jibu lako. Kwa msaada, andika *HELP*.`,

  noPreviousResults: () =>
    `Bado huna matokeo yoyote.\n\n` +
    `Andika *START* kujibu maswali na kupata fursa zako.`,

  feedbackPrompt: () =>
    `*Tungependa maoni yako!* ⭐\n\n` +
    `Kwa kiwango cha 1–5, uzoefu wako na Faida ulikuwaje?\n\n` +
    `*1* — Mbaya\n` +
    `*2* — Wastani\n` +
    `*3* — Vizuri\n` +
    `*4* — Vizuri sana\n` +
    `*5* — Bora kabisa`,

  feedbackComment: () =>
    `Asante! 🙏\n\n` +
    `Maoni yoyote mafupi ya kutusaidia kuboresha? (Si lazima)\n\n` +
    `Andika maoni yako, au *SKIP* kumaliza.`,

  feedbackThanks: (rating) =>
    `✅ Asante kwa maoni yako (${rating}/5)!\n\n` +
    `Maoni yako yanatusaidia kuboresha Faida kwa Wakenya wote.\n\n` +
    `Jibu *MENU* kwa chaguo zaidi.`,

  nearestPrompt: () =>
    `📍 *Tafuta ofisi iliyo karibu*\n\n` +
    `Andika mji au eneo lako (mfano *Westlands*, *Kisumu CBD*, *Mombasa Old Town*).\n\n` +
    `Au andika *0* kutumia kaunti yako kutoka wasifu wako.`,

  nearestNoMatches: () =>
    `Unahitaji kukamilisha maswali kwanza ili kupata ofisi iliyo karibu.\n\n` +
    `Andika *START* kuanza.`,

  invalidAge: () => `Tafadhali andika umri halali (mfano *25*), au *0* ikiwa hujui.`,
  invalidGender: () => `Jibu *1* kwa Mwanaume, *2* kwa Mwanamke, au *0* ikiwa hujui.`,
  invalidCounty: () => `Andika kaunti yako (mfano *Nairobi*), au *0* ikiwa hujui.`,
  invalidEmployment: () =>
    `Jibu:\n*1* — Ninaajiriwa\n*2* — Nina biashara\n*3* — Ninatafuta kazi\n*0* — Sijui`,
  invalidDisability: () => `Jibu *1* kwa Ndiyo, *2* kwa Hapana, au *0* ikiwa hujui.`,
  invalidCategories: (askCategories) =>
    `Jibu na nambari kama *1*, *1,3*, *6* kwa zote, au *0* ikiwa hujui.\n\n${askCategories()}`,
  invalidFeedbackRating: () => `Jibu na nambari kutoka *1* hadi *5*.`,
  invalidDetail: (num) =>
    `Samahani, sina fursa #${num} katika matokeo yako. Jibu *MENU* au *RESULTS*.`,

  resultsHeader: (total) =>
    `✅ *Habari njema! Tumepata fursa ${total} unazoweza kustahili:*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n`,

  resultsFooter: () =>
    `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
    `💡 Jibu *D1*, *D2*, nk. kwa hatua kamili za kuomba.\n` +
    `Jibu *NEAREST* kwa ofisi iliyo karibu · *MENU* kwa chaguo zaidi.`,

  detailFooter: () =>
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `Jibu *MENU* kuangalia fursa nyingine\n` +
    `Jibu *NEAREST* kupata ofisi iliyo karibu\n` +
    `Jibu *SHARE* kushiriki Faida`,

  cardReason: (reasons) =>
    reasons.length > 0 ? `\n_Kwa nini unastahili: ${reasons.join(", ")}_` : "",

  cardApply: (index) => `Jibu *D${index}* kuona jinsi ya kuomba`,

  detailLabels: {
    whatYouGet: "Unachopata:",
    about: "Kuhusu fursa hii:",
    howToApply: "Jinsi ya kuomba:",
    documents: "Nyaraka unazohitaji:",
    deadline: "Muda wa mwisho:",
    link: "Kiungo rasmi:",
  },

  unknownInput: () =>
    `Sielewi. 🤔\n\n` +
    `Jaribu:\n` +
    `• *D1*, *D2*... kwa hatua za kuomba\n` +
    `• *RESULTS* kuona matokeo yako tena\n` +
    `• *START* kuangalia fursa tena\n` +
    `• *MENU* kwa chaguo zote`,

  invalidLanguage: () => `Jibu *1* kwa English au *2* kwa Kiswahili.`,

  remindersOn: () =>
    `✅ *Kumbusho la muda wa mwisho limewashwa*\n\n` +
    `Tutakutumia ujumbe saa 8 asubuhi (Saa za Nairobi) fursa ulizostahili inapokaribia muda wake wa mwisho (siku 7).\n\n` +
    `Jibu *REMINDERS OFF* kuzima kumbusho.`,

  remindersOff: () =>
    `🔕 *Kumbusho la muda wa mwisho limezimwa*\n\n` +
    `Hutapokea kumbusho tena.\n\n` +
    `Jibu *REMINDERS ON* kuwasha tena.`,

  resultActionsMenu: (benefitName) =>
    `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
    `📌 *${benefitName}* — Hatua zifuatazo:\n\n` +
    `*A* — 📝 Omba sasa (nitakusaidia kujaza fomu)\n` +
    `*B* — 📄 Tazama maelezo kamili na ujiambie\n` +
    `*C* — 💾 Hifadhi hii na uangalie fursa zingine`,

  applyNowIntro: (benefitName, estMinutes, fieldCount) =>
    `✅ Vizuri! Tutakusaidia kujaza fomu ya *${benefitName}*.\n\n` +
    `Itachukua takriban dakika *${estMinutes}* (maswali ${fieldCount}).\n\n` +
    `Andika *BACK* kurudi swali lililotangulia\n` +
    `Andika *CANCEL* wakati wowote kuzima na kuhifadhi.\n\n` +
    `Tuanze! 👇`,

  applyFieldQuestion: (label, placeholder, fieldNum, totalFields) =>
    `*${fieldNum}/${totalFields}* — ${label}` +
    (placeholder ? `\n_(${placeholder})_` : ""),

  applyFieldError: (errorMsg) =>
    `⚠️ ${errorMsg}\n\nTafadhali jaribu tena, au andika *BACK* / *CANCEL*.`,

  applyCancelled: (resumeIndex) =>
    `✅ Maombi yamehifadhiwa. Majibu yako yote yamehifadhiwa.\n\n` +
    `Jibu *APPLY${resumeIndex ? ` ${resumeIndex}` : ""}* kuendelea na fursa hii, au *MENU* kwa chaguo zaidi.`,

  applyCompleteHeader: (benefitName, refCode) =>
    `🎉 *Maombi Yamekuwa Tayari!*\n\n` +
    `Asante kwa kukamilisha maombi ya *${benefitName}*.\n\n` +
    `Msimbo wako wa kumbukumbu: *${refCode}*\n` +
    `Hifadhi msimbo huu — utahitaji kwa ofisi.\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n`,

  applyCompleteDocumentInfo: () =>
    `📋 *Fomu ya Maombi Iliojwa Kisha*\n` +
    `(Endelea kusoma — hii ndio fomu yako. Piga picha au nakala!)\n\n`,

  applyCompleteNextStepsOffice: (officeName, address, phone, hours) =>
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📍 *Hatua inayofuata: Tembelea ofisi hii kutoa fomu:*\n\n` +
    `*${officeName}*\n` +
    `${address}\n` +
    `🕐 ${hours}\n` +
    `📞 ${phone}\n\n`,

  applyCompleteNextStepsMobile: (dialCode, website) =>
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📱 *Hatua inayofuata: Omba kwenye simu yako:*\n\n` +
    `Piga *${dialCode}* kwenye simu yako, AU\n` +
    `Tembelea: ${website}\n\n` +
    `Majibu yako hapo juu yako tayari kuingiza.`,

  applyCompleteFooter: () =>
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `Jibu *MENU* kuangalia fursa zingine\n` +
    `Jibu *RESULTS* kuona matokeo yako yote\n` +
    `Jibu *NEAREST* kwa ofisi iliyo karibu`,

  applyResume: () =>
    `⏯️ Unaendeleza na maombi yako yaliyosave...\n\n`,

  applyResumeBenefit: (benefitName, answersCount) =>
    `Una fomu ya *${benefitName}* iliyosave (majibu ${answersCount} yamehifadhiwa).\n\n` +
    `Jibu *1* — Endelea kwa kile ulichokoma\n` +
    `Jibu *2* — Anza upya\n` +
    `Jibu *CANCEL* — Rudi kwenye menyu`,

  invalidApplyAction: () =>
    `Jibu *A*, *B*, au *C* kuchagua hatua inayofuata.\n\n` +
    `*A* — Jaza kwa pamoja\n*B* — Maelezo kamili\n*C* — Fursa zingine`,

  invalidApplyCommand: () =>
    `Kama unataka kuendeleza na maombi yaliyosave, jibu *APPLY* na nambari ya fursa (mfano *APPLY 1*).\n\nAu *MENU* kwa chaguo.`,
};

/**
 * Returns the message set for a given language code.
 */
function getMessages(lang) {
  return lang === "sw" ? MESSAGES_SW : MESSAGES_EN;
}

module.exports = { getMessages, MESSAGES_EN, MESSAGES_SW };
