/** Bilingual content catalogs (flavors, add-ons, milks, sweeteners, roasts, grinds). Content, not UI strings. */
export interface L { ar: string; en: string }
export const l = (ar: string, en: string): L => ({ ar, en });
export const tr = (o: L, lang: string): string => (lang === 'en' ? o.en : o.ar);

/** SCA Coffee Taster's Flavor Wheel families (plus a family for wine/earth/herbal notes). */
export type FamilyId = 'fruity' | 'floral' | 'sweet' | 'nutty-cocoa' | 'spices' | 'roasted' | 'other';
export const FAMILIES: { id: FamilyId; name: L }[] = [
  { id: 'fruity', name: l('فواكه', 'Fruity') },
  { id: 'floral', name: l('زهور', 'Floral') },
  { id: 'sweet', name: l('حلاوة', 'Sweet') },
  { id: 'nutty-cocoa', name: l('مكسرات وكاكاو', 'Nutty & cocoa') },
  { id: 'spices', name: l('توابل', 'Spices') },
  { id: 'roasted', name: l('تحميص ودخان', 'Roasted & smoky') },
  { id: 'other', name: l('نبيذي وترابي وعشبي', 'Winey, earthy & herbal') },
];

export interface Flavor { id: string; family: FamilyId; name: L }
export const FLAVORS: Flavor[] = [
  { id: 'berry', family: 'fruity', name: l('توت', 'Berry') },
  { id: 'citrus', family: 'fruity', name: l('حمضيات', 'Citrus') },
  { id: 'stone-fruit', family: 'fruity', name: l('خوخ ومشمش', 'Stone fruit') },
  { id: 'tropical', name: l('فواكه استوائية', 'Tropical fruit'), family: 'fruity' },
  { id: 'dried-fruit', family: 'fruity', name: l('فواكه مجففة', 'Dried fruit') },
  { id: 'jasmine', family: 'floral', name: l('ياسمين', 'Jasmine') },
  { id: 'rose', family: 'floral', name: l('ورد', 'Rose') },
  { id: 'black-tea', family: 'floral', name: l('شاي أسود', 'Black tea') },
  { id: 'chamomile', family: 'floral', name: l('بابونج', 'Chamomile') },
  { id: 'honey', family: 'sweet', name: l('عسل', 'Honey') },
  { id: 'caramel', family: 'sweet', name: l('كراميل', 'Caramel') },
  { id: 'maple', family: 'sweet', name: l('شراب القيقب', 'Maple syrup') },
  { id: 'brown-sugar', family: 'sweet', name: l('سكر بني', 'Brown sugar') },
  { id: 'vanilla', family: 'sweet', name: l('فانيليا', 'Vanilla') },
  { id: 'hazelnut', family: 'nutty-cocoa', name: l('بندق', 'Hazelnut') },
  { id: 'almond', family: 'nutty-cocoa', name: l('لوز', 'Almond') },
  { id: 'peanut', family: 'nutty-cocoa', name: l('فول سوداني', 'Peanut') },
  { id: 'chocolate', family: 'nutty-cocoa', name: l('شيكولاتة بالحليب', 'Milk chocolate') },
  { id: 'dark-chocolate', family: 'nutty-cocoa', name: l('شيكولاتة داكنة', 'Dark chocolate') },
  { id: 'cardamom', family: 'spices', name: l('هيل', 'Cardamom') },
  { id: 'cinnamon', family: 'spices', name: l('قرفة', 'Cinnamon') },
  { id: 'clove', family: 'spices', name: l('قرنفل', 'Clove') },
  { id: 'nutmeg', family: 'spices', name: l('جوزة الطيب', 'Nutmeg') },
  { id: 'pepper', family: 'spices', name: l('فلفل أسود', 'Black pepper') },
  { id: 'anise', family: 'spices', name: l('يانسون', 'Anise') },
  { id: 'smoky', family: 'roasted', name: l('دخاني', 'Smoky') },
  { id: 'toast', family: 'roasted', name: l('خبز محمص', 'Toasted bread') },
  { id: 'tobacco', family: 'roasted', name: l('تبغ', 'Tobacco') },
  { id: 'malt', family: 'roasted', name: l('شعير ومولت', 'Malt') },
  { id: 'winey', family: 'other', name: l('نبيذي', 'Winey') },
  { id: 'earthy', family: 'other', name: l('ترابي', 'Earthy') },
  { id: 'herbal', family: 'other', name: l('عشبي', 'Herbal') },
];

export type Roast = 'light' | 'medium' | 'mediumdark' | 'dark';
export const ROAST_NAMES: Record<Roast, L> = {
  light: l('فاتح', 'Light'),
  medium: l('وسط', 'Medium'),
  mediumdark: l('وسط غامق', 'Medium-dark'),
  dark: l('غامق', 'Dark'),
};

export type Grind = 'extrafine' | 'fine' | 'medfine' | 'medium' | 'coarse';
export const GRIND_NAMES: Record<Grind, L> = {
  extrafine: l('ناعمة جداً (زي البودرة)', 'Extra fine (powder)'),
  fine: l('ناعمة', 'Fine'),
  medfine: l('وسط ناعمة', 'Medium-fine'),
  medium: l('وسط', 'Medium'),
  coarse: l('خشنة', 'Coarse'),
};

export interface Choice { id: string; name: L }
export const MILKS: Choice[] = [
  { id: 'whole', name: l('لبن كامل الدسم', 'Whole milk') },
  { id: 'lowfat', name: l('لبن قليل الدسم', 'Low-fat milk') },
  { id: 'oat', name: l('لبن الشوفان', 'Oat milk') },
  { id: 'almond', name: l('لبن اللوز', 'Almond milk') },
  { id: 'soy', name: l('لبن الصويا', 'Soy milk') },
  { id: 'coconut', name: l('لبن جوز الهند', 'Coconut milk') },
  { id: 'lactosefree', name: l('لبن خالي اللاكتوز', 'Lactose-free milk') },
  { id: 'cream', name: l('كريمة سائلة', 'Cream') },
];
export const SWEETENERS: Choice[] = [
  { id: 'white-sugar', name: l('سكر أبيض', 'White sugar') },
  { id: 'brown-sugar', name: l('سكر بني', 'Brown sugar') },
  { id: 'honey', name: l('عسل نحل', 'Honey') },
  { id: 'date-syrup', name: l('دبس بلح', 'Date syrup') },
  { id: 'maple', name: l('شراب القيقب', 'Maple syrup') },
  { id: 'stevia', name: l('ستيفيا', 'Stevia') },
  { id: 'sweetener', name: l('محلي صناعي', 'Sweetener tablets') },
  { id: 'condensed', name: l('لبن مكثف محلى', 'Sweetened condensed milk') },
];

export type AddonGroup = 'syrup' | 'sauce' | 'spice' | 'topping' | 'extra';
export interface Addon extends Choice { group: AddonGroup; iced?: boolean }
export const ADDONS: Addon[] = [
  { id: 'vanilla-syrup', group: 'syrup', name: l('سيروب فانيليا', 'Vanilla syrup') },
  { id: 'caramel-syrup', group: 'syrup', name: l('سيروب كراميل', 'Caramel syrup') },
  { id: 'hazelnut-syrup', group: 'syrup', name: l('سيروب بندق', 'Hazelnut syrup') },
  { id: 'cinnamon-syrup', group: 'syrup', name: l('سيروب قرفة', 'Cinnamon syrup') },
  { id: 'coconut-syrup', group: 'syrup', name: l('سيروب جوز الهند', 'Coconut syrup') },
  { id: 'pistachio-syrup', group: 'syrup', name: l('سيروب فستق', 'Pistachio syrup') },
  { id: 'rose-syrup', group: 'syrup', name: l('سيروب ورد', 'Rose syrup') },
  { id: 'lavender-syrup', group: 'syrup', name: l('سيروب لافندر', 'Lavender syrup') },
  { id: 'mint-syrup', group: 'syrup', name: l('سيروب نعناع', 'Mint syrup') },
  { id: 'salted-caramel', group: 'syrup', name: l('كراميل مملح', 'Salted caramel') },
  { id: 'toffee-nut', group: 'syrup', name: l('توفي ومكسرات', 'Toffee nut') },
  { id: 'chocolate-sauce', group: 'sauce', name: l('صوص شيكولاتة', 'Chocolate sauce') },
  { id: 'white-chocolate-sauce', group: 'sauce', name: l('صوص شيكولاتة بيضاء', 'White chocolate sauce') },
  { id: 'caramel-drizzle', group: 'sauce', name: l('رشة صوص كراميل', 'Caramel drizzle') },
  { id: 'cardamom', group: 'spice', name: l('هيل', 'Cardamom') },
  { id: 'cinnamon', group: 'spice', name: l('قرفة', 'Cinnamon') },
  { id: 'nutmeg', group: 'spice', name: l('جوزة الطيب', 'Nutmeg') },
  { id: 'ginger', group: 'spice', name: l('زنجبيل', 'Ginger') },
  { id: 'clove', group: 'spice', name: l('قرنفل', 'Clove') },
  { id: 'saffron', group: 'spice', name: l('زعفران', 'Saffron') },
  { id: 'mastic', group: 'spice', name: l('مستكة', 'Mastic gum') },
  { id: 'rose-water', group: 'spice', name: l('ماء ورد', 'Rose water') },
  { id: 'orange-blossom', group: 'spice', name: l('ماء زهر', 'Orange blossom water') },
  { id: 'whipped-cream', group: 'topping', name: l('كريمة مخفوقة', 'Whipped cream') },
  { id: 'milk-foam', group: 'topping', name: l('رغوة لبن باردة', 'Cold milk foam') },
  { id: 'sweet-cream', group: 'topping', name: l('كريمة حلوة', 'Sweet cream') },
  { id: 'cocoa-powder', group: 'topping', name: l('بودرة كاكاو', 'Cocoa powder') },
  { id: 'chocolate-shavings', group: 'topping', name: l('رقائق شيكولاتة', 'Chocolate shavings') },
  { id: 'marshmallows', group: 'topping', name: l('مارشميلو', 'Marshmallows') },
  { id: 'cookie-crumbs', group: 'topping', name: l('فتات بسكويت', 'Cookie crumbs') },
  { id: 'crushed-pistachio', group: 'topping', name: l('فستق مجروش', 'Crushed pistachio') },
  { id: 'coconut-flakes', group: 'topping', name: l('جوز هند مبشور', 'Coconut flakes') },
  { id: 'extra-shot', group: 'extra', name: l('شوت إسبريسو زيادة', 'Extra espresso shot') },
  { id: 'vanilla-ice-cream', group: 'extra', name: l('آيس كريم فانيليا', 'Vanilla ice cream') },
  { id: 'citrus-twist', group: 'extra', name: l('قشرة برتقال', 'Orange peel twist') },
  { id: 'extra-ice', group: 'extra', iced: true, name: l('تلج زيادة', 'Extra ice') },
  { id: 'coffee-ice-cubes', group: 'extra', iced: true, name: l('مكعبات تلج قهوة', 'Coffee ice cubes') },
];
