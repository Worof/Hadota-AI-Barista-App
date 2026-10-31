import { l, type L } from './catalog';

export interface Article { id: string; title: L; minutes: number; body: { ar: string[]; en: string[] } }

/** Short guides. {hours} is replaced with the freshness promise from config. */
export const ARTICLES: Article[] = [
  {
    id: 'why-fresh', minutes: 3, title: l('ليه الطزاجة بتفرق في فنجانك؟', 'Why freshness changes your cup'),
    body: {
      ar: ['بعد التحميص، البن بيطلّع غاز ثاني أكسيد الكربون لأيام، وده جزء طبيعي من نضج الطعم.', 'مع الوقت، الأكسجين والرطوبة والضوء والحرارة بيضعفوا الروائح والنكهات، وبيبقى الطعم مسطّح أكتر.', 'عشان كده بنحمّص ونوصّل خلال {hours} ساعة، وبنقولك تاريخ التحميص بوضوح.', 'نصيحة: خزّن البن في علبة محكمة بعيد عن الشمس والحرارة، واطحنه قبل التحضير على طول.'],
      en: ['After roasting, beans release carbon dioxide for days, a natural part of the flavor settling in.', 'Over time oxygen, moisture, light and heat dull the aromas and flavors, and the cup tastes flatter.', 'That is why we roast and deliver within {hours} hours, and show you the roast date clearly.', 'Tip: store beans in an airtight container away from sun and heat, and grind right before brewing.'],
    },
  },
  {
    id: 'flavor-wheel', minutes: 3, title: l('إزاي تقرا عجلة النكهات', 'How to read the flavor wheel'),
    body: {
      ar: ['عجلة النكهات (Specialty Coffee Association) بتقسم النكهات لتسع فئات كبيرة: فواكه، زهور، حلاوة، مكسرات وكاكاو، توابل، تحميص، عشبي نباتي، حامض ومتخمّر، وفئة أخرى.', 'ابدأ من الدايرة الصغيرة في النص (فئة كبيرة)، وبعدين اتجه للخارج لحد النكهة الدقيقة زي التوت أو الياسمين.', 'ما تقلقش لو مش حاسس بكل حاجة: اتدرّب بالمقارنة بين نوعين بن جنب بعض.', 'في حدوتة، اختار الريحة الأول وبعدين النكهة، وهو هيطابقهم مع أنواع البن.'],
      en: ['The Specialty Coffee Association flavor wheel groups flavors into nine broad families: fruity, floral, sweet, nutty/cocoa, spices, roasted, green/vegetative, sour/fermented and other.', 'Start in the center (a broad family), then move outward to the specific note, like berry or jasmine.', 'Do not worry if you cannot taste everything: train by tasting two beans side by side.', 'In Hadota, pick the aroma first, then the flavor, and he matches them to beans.'],
    },
  },
  {
    id: 'ibrik', minutes: 3, title: l('قهوة الركوة المظبوطة', 'The perfect ibrik coffee'),
    body: {
      ar: ['استخدم بن مطحون ناعم جداً (زي البودرة) ومية باردة، حوالي ٧ جرام لكل فنجان صغير.', 'حط الركوة على نار هادية وسيبها من غير تقليب كتير، وخلّي بالك من الوش.', 'لما الوش يطلع ويقرّب يفور، شيلها من النار قبل الغليان الشديد.', 'صبّها بالراحة، وسيب التُفل ينزل قبل أول رشفة. ولو بتحب هيل أو مستكة، ضيفهم في الآخر.'],
      en: ['Use a very fine grind (like powder) and cold water, about 7 g per small cup.', 'Heat gently without stirring much, and watch the foam.', 'When the foam rises and nears boiling, lift it off before a hard boil.', 'Pour slowly and let the grounds settle before the first sip. Add cardamom or mastic if you like.'],
    },
  },
  {
    id: 'beans', minutes: 4, title: l('أنواع البن الأربعة', 'The four types of coffee bean'),
    body: {
      ar: ['الأرابيكا هي الأكتر زراعة، وغالباً بتتميز بحلاوة وحموضة ونكهات أكتر تنوعاً.', 'الروبوستا أقوى وأمّرّ وفيها كافيين أعلى وقوام أتقل، وبتتحب في الإسبريسو والقهوة الغامقة.', 'الليبيريكا نادرة وليها طابع دخاني مميز، والإكسلسا بتتصنف حالياً كنوع من الليبيريكا وبتتميز بنكهة حمضية فاكهية.', 'الأهم من النوع: بلد المنشأ والصنف والتحميص. جرّب في حدوتة وقارن.'],
      en: ['Arabica is the most widely grown and usually brings sweetness, acidity and a wider range of flavors.', 'Robusta is stronger and more bitter, with higher caffeine and a heavier body, loved in espresso and dark coffee.', 'Liberica is rare with a distinctive smoky character, and Excelsa is now classed as a Liberica variety with a tart, fruity note.', 'More important than the type: the origin, the variety and the roast. Try them in Hadota and compare.'],
    },
  },
  {
    id: 'acidity', minutes: 2, title: l('الحموضة مش معناها حامض', 'Acidity does not mean sour'),
    body: {
      ar: ['في عالم القهوة، الحموضة معناها الانتعاش والفاكهية، زي لمعة الليمون أو التفاح.', 'القهوة الفاتحة غالباً أنعش، والغامقة أهدى وأتقل.', 'لو بتحب اللبن، قلل الحموضة العالية لأن اللبن بيهديها.', 'حدوتة بيسألك عنها مباشرة، وانت اللي بتحدد.'],
      en: ['In coffee, acidity means brightness and fruitiness, like the sparkle of lemon or apple.', 'Light roasts are usually brighter, dark roasts calmer and heavier.', 'If you take milk, keep acidity moderate because milk softens it.', 'Hadota asks you about it directly, and you decide.'],
    },
  },
];
