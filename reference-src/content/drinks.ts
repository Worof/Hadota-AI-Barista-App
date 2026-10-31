import { l, type L } from './catalog';

export type Family = 'traditional' | 'espresso' | 'brewed';
export type Method = 'ibrik' | 'espresso' | 'moka' | 'aeropress' | 'french' | 'pourover' | 'coldbrew' | 'phin';
export type Serve = 'hot' | 'iced';

export interface Drink {
  id: string;
  name: L;
  serve: Serve[];
  family: Family;
  /** espresso shots (espresso family) */
  shots: number;
  /** milk per serving in ml (0 = none) */
  milkMl: number;
  methods: Method[];
  /** sweetened by default with condensed milk, chocolate, etc. */
  note?: L;
}

const ESP: Method[] = ['espresso', 'moka', 'aeropress'];

/** Drinks served at cafés and chains everywhere (generic names, no brand trademarks). */
export const DRINKS: Drink[] = [
  { id: 'turkish', name: l('قهوة تركي', 'Turkish coffee'), serve: ['hot'], family: 'traditional', shots: 0, milkMl: 0, methods: ['ibrik'] },
  { id: 'arabic', name: l('قهوة عربي بالهيل', 'Arabic cardamom coffee'), serve: ['hot'], family: 'traditional', shots: 0, milkMl: 0, methods: ['ibrik'] },
  { id: 'espresso', name: l('إسبريسو', 'Espresso'), serve: ['hot'], family: 'espresso', shots: 1, milkMl: 0, methods: ESP },
  { id: 'doppio', name: l('دوبيو (إسبريسو دبل)', 'Doppio'), serve: ['hot'], family: 'espresso', shots: 2, milkMl: 0, methods: ESP },
  { id: 'ristretto', name: l('ريستريتو', 'Ristretto'), serve: ['hot'], family: 'espresso', shots: 1, milkMl: 0, methods: ESP },
  { id: 'lungo', name: l('لونجو', 'Lungo'), serve: ['hot'], family: 'espresso', shots: 1, milkMl: 0, methods: ESP },
  { id: 'americano', name: l('أمريكانو', 'Americano'), serve: ['hot', 'iced'], family: 'espresso', shots: 2, milkMl: 0, methods: ESP },
  { id: 'espresso-macchiato', name: l('إسبريسو ماكياتو', 'Espresso macchiato'), serve: ['hot'], family: 'espresso', shots: 1, milkMl: 15, methods: ESP },
  { id: 'con-panna', name: l('إسبريسو كون بانا', 'Espresso con panna'), serve: ['hot'], family: 'espresso', shots: 1, milkMl: 0, methods: ESP },
  { id: 'cortado', name: l('كورتادو', 'Cortado'), serve: ['hot'], family: 'espresso', shots: 2, milkMl: 60, methods: ESP },
  { id: 'flat-white', name: l('فلات وايت', 'Flat white'), serve: ['hot', 'iced'], family: 'espresso', shots: 2, milkMl: 120, methods: ESP },
  { id: 'cappuccino', name: l('كابتشينو', 'Cappuccino'), serve: ['hot'], family: 'espresso', shots: 1, milkMl: 120, methods: ESP },
  { id: 'latte', name: l('لاتيه', 'Latte'), serve: ['hot', 'iced'], family: 'espresso', shots: 1, milkMl: 220, methods: ESP },
  { id: 'latte-macchiato', name: l('لاتيه ماكياتو', 'Latte macchiato'), serve: ['hot', 'iced'], family: 'espresso', shots: 1, milkMl: 220, methods: ESP },
  { id: 'mocha', name: l('موكا', 'Mocha'), serve: ['hot', 'iced'], family: 'espresso', shots: 1, milkMl: 200, methods: ESP },
  { id: 'white-mocha', name: l('موكا بيضاء', 'White chocolate mocha'), serve: ['hot', 'iced'], family: 'espresso', shots: 1, milkMl: 200, methods: ESP },
  { id: 'caramel-macchiato', name: l('كراميل ماكياتو', 'Caramel macchiato'), serve: ['hot', 'iced'], family: 'espresso', shots: 1, milkMl: 200, methods: ESP },
  { id: 'cinnamon-latte', name: l('لاتيه بالقرفة والسكر', 'Cinnamon brown-sugar latte'), serve: ['hot', 'iced'], family: 'espresso', shots: 1, milkMl: 200, methods: ESP },
  { id: 'spanish-latte', name: l('سبانش لاتيه (باللبن المكثف)', 'Spanish latte'), serve: ['hot', 'iced'], family: 'espresso', shots: 1, milkMl: 150, methods: ESP, note: l('بيتحلى باللبن المكثف', 'Sweetened with condensed milk') },
  { id: 'affogato', name: l('أفوجاتو', 'Affogato'), serve: ['hot'], family: 'espresso', shots: 1, milkMl: 0, methods: ESP, note: l('إسبريسو فوق آيس كريم فانيليا', 'Espresso over vanilla ice cream') },
  { id: 'shaken-espresso', name: l('إسبريسو مهزوز بالتلج', 'Iced shaken espresso'), serve: ['iced'], family: 'espresso', shots: 2, milkMl: 60, methods: ESP },
  { id: 'espresso-tonic', name: l('إسبريسو تونك', 'Espresso tonic'), serve: ['iced'], family: 'espresso', shots: 2, milkMl: 0, methods: ESP },
  { id: 'blended-iced', name: l('قهوة مثلجة مخفوقة (فرابيه)', 'Blended iced coffee (frappé style)'), serve: ['iced'], family: 'espresso', shots: 2, milkMl: 150, methods: ESP },
  { id: 'filter', name: l('قهوة فلتر', 'Drip / filter coffee'), serve: ['hot'], family: 'brewed', shots: 0, milkMl: 0, methods: ['pourover'] },
  { id: 'pour-over', name: l('بور أوفر (V60)', 'Pour-over (V60)'), serve: ['hot'], family: 'brewed', shots: 0, milkMl: 0, methods: ['pourover'] },
  { id: 'french-press', name: l('قهوة فرنش بريس', 'French press'), serve: ['hot'], family: 'brewed', shots: 0, milkMl: 0, methods: ['french'] },
  { id: 'aeropress', name: l('إيروبريس', 'AeroPress coffee'), serve: ['hot'], family: 'brewed', shots: 0, milkMl: 0, methods: ['aeropress'] },
  { id: 'moka-pot', name: l('قهوة موكا بوت', 'Moka pot coffee'), serve: ['hot'], family: 'brewed', shots: 0, milkMl: 0, methods: ['moka'] },
  { id: 'iced-coffee', name: l('آيس كوفي (قهوة فلتر مثلجة)', 'Iced coffee'), serve: ['iced'], family: 'brewed', shots: 0, milkMl: 0, methods: ['pourover', 'french'] },
  { id: 'cold-brew', name: l('كولد برو', 'Cold brew'), serve: ['iced'], family: 'brewed', shots: 0, milkMl: 0, methods: ['coldbrew'] },
  { id: 'cold-brew-latte', name: l('كولد برو لاتيه', 'Cold brew latte'), serve: ['iced'], family: 'brewed', shots: 0, milkMl: 120, methods: ['coldbrew'] },
  { id: 'cold-brew-cream', name: l('كولد برو بالكريمة الحلوة', 'Cold brew with sweet cream'), serve: ['iced'], family: 'brewed', shots: 0, milkMl: 60, methods: ['coldbrew'], note: l('بدل النيترو: كريمة حلوة فوق الكولد برو', 'Home take on nitro: sweet cream over cold brew') },
  { id: 'phin', name: l('قهوة فيتنامية بالمكثف (فين)', 'Vietnamese phin coffee'), serve: ['hot', 'iced'], family: 'brewed', shots: 0, milkMl: 0, methods: ['phin'], note: l('بتتحلى باللبن المكثف', 'Served with condensed milk') },
];

export const METHOD_NAMES: Record<Method, L> = {
  ibrik: l('ركوة', 'Ibrik (rakwa)'),
  espresso: l('مكنة إسبريسو', 'Espresso machine'),
  moka: l('موكا بوت', 'Moka pot'),
  aeropress: l('إيروبريس', 'AeroPress'),
  french: l('فرنش بريس', 'French press'),
  pourover: l('فلتر / بور أوفر', 'Filter / pour-over'),
  coldbrew: l('برطمان كولد برو', 'Cold-brew jar'),
  phin: l('فين فيتنامي', 'Vietnamese phin'),
};

export const drinkById = (id: string): Drink | undefined => DRINKS.find((d) => d.id === id);
