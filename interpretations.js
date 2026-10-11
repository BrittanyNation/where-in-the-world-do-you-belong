/* Original line interpretations for Where in the World Do You Belong */
const LINE_MEANINGS = {
  Sun: {
    MC:  { title: "Sun on the Midheaven — your spotlight line", text: "This is the career-visibility line. Here you are seen, recognized, and taken seriously. Authority comes naturally, leadership roles find you, and your work gets noticed. If you want to be known for what you do, spend time here." },
    IC:  { title: "Sun on the IC — your roots line", text: "This line is about home, family, and foundations. Here you recharge by going inward: nesting, tending your private life, reconnecting with where you come from. A powerful place to live when you want life to feel grounded." },
    ASC: { title: "Sun rising — your vitality line", text: "Pure life force. Here you feel more yourself: confident, energized, magnetic. People respond to your presence. Health, charisma, and self-expression all get a boost along this line." },
    DSC: { title: "Sun on the Descendant — your partnership line", text: "Significant others take center stage here: romance, close friendships, business partnerships. You attract strong personalities, and relationships tend to define this chapter. Choose your people well." },
  },
  Moon: {
    MC:  { title: "Moon on the Midheaven — your public-heart line", text: "Your emotional life goes public here, in the best way. Nurturing professions thrive, audiences warm to you, and your intuition about people is razor sharp. A lovely line for anyone whose work involves caring for others." },
    IC:  { title: "Moon on the IC — your sanctuary line", text: "The deepest home line there is. Here domestic life, family bonds, and emotional safety flourish. You may feel strongly pulled to nest, cook, host, and put down roots. Feelings run deep and tender here." },
    ASC: { title: "Moon rising — your sensitivity line", text: "Your emotional radar is turned all the way up. You feel everything, and others feel you. Great for creative and caring work; just guard your energy, because you absorb the mood of every room." },
    DSC: { title: "Moon on the Descendant — your emotional-bond line", text: "Relationships here are tender, intimate, and emotionally rich. You crave closeness and find it. Family-like bonds form fast, for better or worse, so give trust at a pace that honors you." },
  },
  Mercury: {
    MC:  { title: "Mercury on the Midheaven — your voice line", text: "Communication is your superpower here. Writing, speaking, teaching, selling ideas: your words land. A strong line for media, marketing, and any career built on being heard." },
    IC:  { title: "Mercury on the IC — your study line", text: "A thinker's retreat. Here your mind turns inward: research, journaling, learning, family stories. Great for students and anyone doing deep intellectual or ancestral work." },
    ASC: { title: "Mercury rising — your quick-mind line", text: "Witty, curious, quick on your feet. Conversations sparkle, ideas flow, and you learn fast. Networking here is effortless because genuine curiosity does the work for you." },
    DSC: { title: "Mercury on the Descendant — your dialogue line", text: "One-on-one conversations carry weight here. Negotiations go well, friendships form through talk, and you meet clever, interesting people. Say what you mean; it will be heard." },
  },
  Venus: {
    MC:  { title: "Venus on the Midheaven — your charm line", text: "Popularity and grace follow you here. Careers in beauty, art, design, and hospitality shine, and people simply like having you around. Social doors open with unusual ease." },
    IC:  { title: "Venus on the IC — your sweet-home line", text: "Home becomes a haven of comfort and beauty. Decorating, hosting, and domestic pleasures feel deeply satisfying. If you want your home to feel like a warm hug, this is the line." },
    ASC: { title: "Venus rising — your magnetism line", text: "You glow here. Attractiveness, kindness, and ease in social situations all rise. Romance favors you, friendships multiply, and life just feels softer and prettier." },
    DSC: { title: "Venus on the Descendant — your harmony line", text: "Relationships flow with unusual grace here. Partnerships are affectionate and fair, conflicts resolve gently, and you attract loving, considerate people. A beautiful line for love." },
  },
  Mars: {
    MC:  { title: "Mars on the Midheaven — your drive line", text: "Ambition ignites here. You work harder, push further, and compete to win. Excellent for launching ventures and proving yourself, just watch the burnout and keep the temper in check." },
    IC:  { title: "Mars on the IC — your fire-at-home line", text: "Home life runs hot here: passionate, active, sometimes volatile. Channel it into projects, renovations, and movement. Restlessness at home means you need an outlet, not a fight." },
    ASC: { title: "Mars rising — your courage line", text: "Bold, direct, unstoppable. You go after what you want and people get out of the way, or get inspired. Athletic energy and decisiveness peak here. Lead with courage, not sharp elbows." },
    DSC: { title: "Mars on the Descendant — your spark line", text: "Relationships here are electric: passionate, dynamic, and occasionally combustible. You attract strong-willed people and chemistry runs high. Exciting, but choose partners who respect you." },
  },
  Jupiter: {
    MC:  { title: "Jupiter on the Midheaven — your expansion line", text: "The classic luck line for career. Opportunities multiply, mentors appear, and your ambitions get tailwinds. Recognition and growth come more easily here than almost anywhere. Bet on yourself." },
    IC:  { title: "Jupiter on the IC — your abundance-at-home line", text: "Home life expands in the best ways: comfort, generosity, space to breathe. Family luck runs high and your living situation tends to improve. A wonderful line to put down roots." },
    ASC: { title: "Jupiter rising — your golden line", text: "The luckiest line on the map. Optimism, opportunity, and benevolent people surround you. Things work out, often better than planned. Travel, learning, and new ventures are all favored here." },
    DSC: { title: "Jupiter on the Descendant — your benefactor line", text: "You meet generous, uplifting people here: mentors, supporters, true friends. Partnerships are fortunate and relationships tend to bring out your best. Say yes to introductions." },
  },
  Saturn: {
    MC:  { title: "Saturn on the Midheaven — your mastery line", text: "Slow-build success. Here reputation is earned through discipline and excellence, and what you build lasts. Demanding but deeply rewarding for long-term career foundations." },
    IC:  { title: "Saturn on the IC — your foundations line", text: "A serious line for home and family: responsibility, structure, dealing with roots and elders. Heavy at times, but excellent for building something solid that endures." },
    ASC: { title: "Saturn rising — your gravitas line", text: "You are taken seriously here, sometimes more seriously than is fun. Maturity, discipline, and self-reliance grow. Remember to play: Saturn rewards work, but joy is not the enemy." },
    DSC: { title: "Saturn on the Descendant — your commitment line", text: "Relationships here are serious and defining: long-term bonds, significant commitments, lessons in boundaries. You attract mature partners and learn what you truly require of others." },
  },
};

const ANGLE_NAMES = { MC: "Midheaven", IC: "IC (home base)", ASC: "Ascendant (rising)", DSC: "Descendant (relationships)" };
