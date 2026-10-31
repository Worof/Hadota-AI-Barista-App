const l = (ar, en) => ({ ar, en });
const tr = (o, lang) => (lang === 'en' ? o.en : o.ar);
const FAMILIES = [
    { id: 'fruity', name: l('فواكه', 'Fruity') },
    { id: 'floral', name: l('زهور', 'Floral') },
    { id: 'sweet', name: l('حلاوة', 'Sweet') },
    { id: 'nutty-cocoa', name: l('مكسرات وكاكاو', 'Nutty & cocoa') },
    { id: 'spices', name: l('توابل', 'Spices') },
    { id: 'roasted', name: l('تحميص ودخان', 'Roasted & smoky') },
    { id: 'other', name: l('نبيذي وترابي وعشبي', 'Winey, earthy & herbal') },
];
const FLAVORS = [
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
const ROAST_NAMES = {
    light: l('فاتح', 'Light'),
    medium: l('وسط', 'Medium'),
    mediumdark: l('وسط غامق', 'Medium-dark'),
    dark: l('غامق', 'Dark'),
};
const GRIND_NAMES = {
    extrafine: l('ناعمة جداً (زي البودرة)', 'Extra fine (powder)'),
    fine: l('ناعمة', 'Fine'),
    medfine: l('وسط ناعمة', 'Medium-fine'),
    medium: l('وسط', 'Medium'),
    coarse: l('خشنة', 'Coarse'),
};
const MILKS = [
    { id: 'whole', name: l('لبن كامل الدسم', 'Whole milk') },
    { id: 'lowfat', name: l('لبن قليل الدسم', 'Low-fat milk') },
    { id: 'oat', name: l('لبن الشوفان', 'Oat milk') },
    { id: 'almond', name: l('لبن اللوز', 'Almond milk') },
    { id: 'soy', name: l('لبن الصويا', 'Soy milk') },
    { id: 'coconut', name: l('لبن جوز الهند', 'Coconut milk') },
    { id: 'lactosefree', name: l('لبن خالي اللاكتوز', 'Lactose-free milk') },
    { id: 'cream', name: l('كريمة سائلة', 'Cream') },
];
const SWEETENERS = [
    { id: 'white-sugar', name: l('سكر أبيض', 'White sugar') },
    { id: 'brown-sugar', name: l('سكر بني', 'Brown sugar') },
    { id: 'honey', name: l('عسل نحل', 'Honey') },
    { id: 'date-syrup', name: l('دبس بلح', 'Date syrup') },
    { id: 'maple', name: l('شراب القيقب', 'Maple syrup') },
    { id: 'stevia', name: l('ستيفيا', 'Stevia') },
    { id: 'sweetener', name: l('محلي صناعي', 'Sweetener tablets') },
    { id: 'condensed', name: l('لبن مكثف محلى', 'Sweetened condensed milk') },
];
const ADDONS = [
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


const ESP = ['espresso', 'moka', 'aeropress'];
/** Drinks served at cafés and chains everywhere (generic names, no brand trademarks). */
const DRINKS = [
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
const METHOD_NAMES = {
    ibrik: l('ركوة', 'Ibrik (rakwa)'),
    espresso: l('مكنة إسبريسو', 'Espresso machine'),
    moka: l('موكا بوت', 'Moka pot'),
    aeropress: l('إيروبريس', 'AeroPress'),
    french: l('فرنش بريس', 'French press'),
    pourover: l('فلتر / بور أوفر', 'Filter / pour-over'),
    coldbrew: l('برطمان كولد برو', 'Cold-brew jar'),
    phin: l('فين فيتنامي', 'Vietnamese phin'),
};
const drinkById = (id) => DRINKS.find((d) => d.id === id);


/**
 * Profiles are typical regional/varietal tendencies (SCA flavor families, public roaster guides),
 * not lab data. Confirm stock and sourcing per lot before promising a specific bean.
 * Excelsa is classed as a variety of Liberica (reclassified 2006) but sold as its own bean type.
 */
const BEANS = [
    { id: 'ethiopia-yirgacheffe', species: 'arabica', variety: l('هيرلوم إثيوبي', 'Ethiopian heirloom'), name: l('إثيوبيا يرجاشيف', 'Ethiopia Yirgacheffe'), origin: l('إثيوبيا', 'Ethiopia'), region: 'africa', acidity: 3, body: 1, sweet: 2, caffeine: 1, aroma: ['floral', 'fruity'], notes: ['jasmine', 'citrus', 'black-tea', 'honey'], roasts: ['light', 'medium'] },
    { id: 'ethiopia-sidamo', species: 'arabica', variety: l('هيرلوم إثيوبي', 'Ethiopian heirloom'), name: l('إثيوبيا سيدامو', 'Ethiopia Sidamo'), origin: l('إثيوبيا', 'Ethiopia'), region: 'africa', acidity: 3, body: 2, sweet: 2, caffeine: 1, aroma: ['fruity', 'floral'], notes: ['berry', 'citrus', 'honey'], roasts: ['light', 'medium'] },
    { id: 'ethiopia-harrar', species: 'arabica', variety: l('هيرلوم إثيوبي (مجفف طبيعي)', 'Ethiopian heirloom (natural)'), name: l('إثيوبيا هرر', 'Ethiopia Harrar'), origin: l('إثيوبيا', 'Ethiopia'), region: 'africa', acidity: 2, body: 2, sweet: 2, caffeine: 1, aroma: ['fruity', 'spices'], notes: ['berry', 'winey', 'dark-chocolate'], roasts: ['medium', 'mediumdark'] },
    { id: 'kenya-aa', species: 'arabica', variety: l('SL28 / SL34', 'SL28 / SL34'), name: l('كينيا AA', 'Kenya AA'), origin: l('كينيا', 'Kenya'), region: 'africa', acidity: 3, body: 2, sweet: 2, caffeine: 1, aroma: ['fruity'], notes: ['berry', 'citrus', 'winey'], roasts: ['light', 'medium'] },
    { id: 'rwanda-bourbon', species: 'arabica', variety: l('بوربون أحمر', 'Red Bourbon'), name: l('رواندا بوربون', 'Rwanda Bourbon'), origin: l('رواندا', 'Rwanda'), region: 'africa', acidity: 2, body: 2, sweet: 3, caffeine: 1, aroma: ['floral', 'sweet'], notes: ['black-tea', 'caramel', 'berry'], roasts: ['light', 'medium'] },
    { id: 'tanzania-peaberry', species: 'arabica', variety: l('بوربون (حبة بيبري)', 'Bourbon (peaberry)'), name: l('تنزانيا بيبري', 'Tanzania Peaberry'), origin: l('تنزانيا', 'Tanzania'), region: 'africa', acidity: 3, body: 2, sweet: 1, caffeine: 1, aroma: ['fruity', 'other'], notes: ['citrus', 'winey', 'chocolate'], roasts: ['light', 'medium'] },
    { id: 'yemen-mattari', species: 'arabica', variety: l('هيرلوم يمني (مطري)', 'Yemeni heirloom (Mattari)'), name: l('اليمن مطري', 'Yemen Mattari'), origin: l('اليمن', 'Yemen'), region: 'arabia', acidity: 2, body: 3, sweet: 2, caffeine: 1, aroma: ['spices', 'nutty-cocoa'], notes: ['dark-chocolate', 'dried-fruit', 'winey', 'pepper'], roasts: ['medium', 'mediumdark'] },
    { id: 'colombia-supremo', species: 'arabica', variety: l('كاتورا / كاستيو', 'Caturra / Castillo'), name: l('كولومبيا سوبريمو', 'Colombia Supremo'), origin: l('كولومبيا', 'Colombia'), region: 'americas', acidity: 2, body: 2, sweet: 2, caffeine: 1, aroma: ['sweet', 'nutty-cocoa'], notes: ['caramel', 'hazelnut', 'chocolate'], roasts: ['medium', 'mediumdark'] },
    { id: 'brazil-santos', species: 'arabica', variety: l('بوربون / موندو نوفو', 'Bourbon / Mundo Novo'), name: l('البرازيل سانتوس', 'Brazil Santos'), origin: l('البرازيل', 'Brazil'), region: 'americas', acidity: 1, body: 3, sweet: 2, caffeine: 1, aroma: ['nutty-cocoa', 'sweet'], notes: ['peanut', 'chocolate', 'hazelnut', 'brown-sugar'], roasts: ['medium', 'mediumdark', 'dark'] },
    { id: 'guatemala-antigua', species: 'arabica', variety: l('بوربون / كاتورا', 'Bourbon / Caturra'), name: l('جواتيمالا أنتيجوا', 'Guatemala Antigua'), origin: l('جواتيمالا', 'Guatemala'), region: 'americas', acidity: 2, body: 3, sweet: 2, caffeine: 1, aroma: ['spices', 'nutty-cocoa'], notes: ['chocolate', 'cinnamon', 'caramel'], roasts: ['medium', 'mediumdark'] },
    { id: 'costa-rica-tarrazu', species: 'arabica', variety: l('كاتورا / كاتواي', 'Caturra / Catuai'), name: l('كوستاريكا تاراسو', 'Costa Rica Tarrazú'), origin: l('كوستاريكا', 'Costa Rica'), region: 'americas', acidity: 3, body: 2, sweet: 2, caffeine: 1, aroma: ['fruity', 'sweet'], notes: ['citrus', 'honey', 'brown-sugar'], roasts: ['light', 'medium'] },
    { id: 'el-salvador-pacamara', species: 'arabica', variety: l('باكامارا', 'Pacamara'), name: l('السلفادور باكامارا', 'El Salvador Pacamara'), origin: l('السلفادور', 'El Salvador'), region: 'americas', acidity: 2, body: 2, sweet: 3, caffeine: 1, aroma: ['sweet', 'fruity'], notes: ['caramel', 'chocolate', 'citrus'], roasts: ['light', 'medium'] },
    { id: 'panama-geisha', species: 'arabica', variety: l('جيشا', 'Geisha (Gesha)'), name: l('بنما جيشا', 'Panama Geisha'), origin: l('بنما', 'Panama'), region: 'americas', acidity: 3, body: 1, sweet: 2, caffeine: 1, aroma: ['floral', 'fruity'], notes: ['jasmine', 'tropical', 'citrus', 'black-tea'], roasts: ['light'] },
    { id: 'mexico-chiapas', species: 'arabica', variety: l('تيبيكا / بوربون', 'Typica / Bourbon'), name: l('المكسيك تشياباس', 'Mexico Chiapas'), origin: l('المكسيك', 'Mexico'), region: 'americas', acidity: 2, body: 2, sweet: 1, caffeine: 1, aroma: ['nutty-cocoa'], notes: ['almond', 'chocolate', 'brown-sugar'], roasts: ['medium', 'mediumdark'] },
    { id: 'peru-chanchamayo', species: 'arabica', variety: l('تيبيكا / كاتورا', 'Typica / Caturra'), name: l('بيرو تشانتشاماو', 'Peru Chanchamayo'), origin: l('بيرو', 'Peru'), region: 'americas', acidity: 2, body: 1, sweet: 2, caffeine: 1, aroma: ['sweet', 'nutty-cocoa'], notes: ['caramel', 'almond', 'chocolate'], roasts: ['medium'] },
    { id: 'jamaica-blue-mountain', species: 'arabica', variety: l('تيبيكا', 'Typica'), name: l('جامايكا بلو ماونتن', 'Jamaica Blue Mountain'), origin: l('جامايكا', 'Jamaica'), region: 'americas', acidity: 2, body: 1, sweet: 3, caffeine: 1, aroma: ['sweet'], notes: ['honey', 'vanilla', 'almond'], roasts: ['light', 'medium'] },
    { id: 'hawaii-kona', species: 'arabica', variety: l('تيبيكا', 'Typica'), name: l('هاواي كونا', 'Hawaii Kona'), origin: l('هاواي', 'Hawaii'), region: 'americas', acidity: 2, body: 2, sweet: 3, caffeine: 1, aroma: ['sweet', 'nutty-cocoa'], notes: ['honey', 'almond', 'caramel'], roasts: ['medium'] },
    { id: 'sumatra-mandheling', species: 'arabica', variety: l('تيبيكا / أتينج', 'Typica / Ateng'), name: l('سومطرة ماندهيلينج', 'Sumatra Mandheling'), origin: l('إندونيسيا', 'Indonesia'), region: 'asia', acidity: 0, body: 3, sweet: 1, caffeine: 1, aroma: ['other', 'roasted'], notes: ['earthy', 'herbal', 'dark-chocolate', 'tobacco'], roasts: ['mediumdark', 'dark'] },
    { id: 'java-estate', species: 'arabica', variety: l('تيبيكا', 'Typica'), name: l('جاوة إستيت', 'Java Estate'), origin: l('إندونيسيا', 'Indonesia'), region: 'asia', acidity: 1, body: 3, sweet: 1, caffeine: 1, aroma: ['other', 'nutty-cocoa'], notes: ['earthy', 'dark-chocolate', 'cinnamon'], roasts: ['medium', 'mediumdark', 'dark'] },
    { id: 'india-monsooned-malabar', species: 'arabica', variety: l('كينت / S795 (محمّل بالرياح الموسمية)', 'Kent / S795 (monsooned)'), name: l('الهند مونسونيد مالابار', 'India Monsooned Malabar'), origin: l('الهند', 'India'), region: 'asia', acidity: 0, body: 3, sweet: 1, caffeine: 1, aroma: ['spices', 'nutty-cocoa'], notes: ['pepper', 'peanut', 'chocolate', 'earthy'], roasts: ['mediumdark', 'dark'] },
    { id: 'png-sigri', species: 'arabica', variety: l('تيبيكا / أروشا', 'Typica / Arusha'), name: l('بابوا غينيا الجديدة', 'Papua New Guinea'), origin: l('بابوا غينيا الجديدة', 'Papua New Guinea'), region: 'asia', acidity: 2, body: 2, sweet: 2, caffeine: 1, aroma: ['fruity', 'spices'], notes: ['tropical', 'brown-sugar', 'clove'], roasts: ['light', 'medium'] },
    { id: 'uganda-robusta', species: 'robusta', variety: l('روبوستا نجاندا', 'Robusta (Nganda)'), name: l('أوغندا روبوستا', 'Uganda Robusta'), origin: l('أوغندا', 'Uganda'), region: 'africa', acidity: 0, body: 3, sweet: 1, caffeine: 3, aroma: ['roasted', 'nutty-cocoa'], notes: ['dark-chocolate', 'earthy', 'malt'], roasts: ['mediumdark', 'dark'] },
    { id: 'vietnam-robusta', species: 'robusta', variety: l('روبوستا (كونيلون)', 'Robusta (Conilon)'), name: l('فيتنام روبوستا', 'Vietnam Robusta'), origin: l('فيتنام', 'Vietnam'), region: 'asia', acidity: 0, body: 3, sweet: 1, caffeine: 3, aroma: ['roasted', 'nutty-cocoa'], notes: ['dark-chocolate', 'malt', 'smoky', 'earthy'], roasts: ['mediumdark', 'dark'] },
    { id: 'philippines-liberica', species: 'liberica', variety: l('ليبيريكا (باراكو)', 'Liberica (Barako)'), name: l('الفلبين ليبيريكا', 'Philippines Liberica'), origin: l('الفلبين', 'Philippines'), region: 'asia', acidity: 1, body: 3, sweet: 1, caffeine: 1, aroma: ['roasted', 'other'], notes: ['smoky', 'tobacco', 'earthy'], roasts: ['mediumdark', 'dark'] },
    { id: 'malaysia-excelsa', species: 'excelsa', variety: l('إكسلسا (نوع من الليبيريكا)', 'Excelsa (a Liberica variety)'), name: l('ماليزيا إكسلسا', 'Malaysia Excelsa'), origin: l('ماليزيا', 'Malaysia'), region: 'asia', acidity: 3, body: 1, sweet: 2, caffeine: 1, aroma: ['fruity', 'roasted'], notes: ['berry', 'citrus', 'toast'], roasts: ['medium', 'mediumdark'] },
];


/** Short guides. {hours} is replaced with the freshness promise from config. */
const ARTICLES = [
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

const one = (a, k) => (typeof a[k] === 'string' ? a[k] : undefined);
const many = (a, k) => (Array.isArray(a[k]) ? a[k] : []);

const newModel = (d) => ({
    n: 0,
    A: Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => (i === j ? 1 : 0))),
    b: Array(d).fill(0),
});
/** rating 1..5 -> reward -1..1 */
const rewardOfRating = (rating) => (Math.min(5, Math.max(1, rating)) - 3) / 2;
/** Confidence in the personal model grows with the number of ratings (full trust from 5). */
const trust = (n) => Math.min(1, n / REC_CFG.ramp);
function inverse(M) {
    const n = M.length;
    const a = M.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
    for (let c = 0; c < n; c++) {
        let p = c;
        for (let r = c + 1; r < n; r++)
            if (Math.abs(a[r][c]) > Math.abs(a[p][c]))
                p = r;
        [a[c], a[p]] = [a[p], a[c]];
        const d = a[c][c] || 1e-9;
        for (let j = 0; j < 2 * n; j++)
            a[c][j] /= d;
        for (let r = 0; r < n; r++) {
            if (r === c)
                continue;
            const f = a[r][c];
            if (f)
                for (let j = 0; j < 2 * n; j++)
                    a[r][j] -= f * a[c][j];
        }
    }
    return a.map((r) => r.slice(n));
}
const mv = (M, v) => M.map((r) => r.reduce((s, x, j) => s + x * v[j], 0));
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
/** Predicted reward for context x and an uncertainty bonus (exploration). */
function stats(m, x, alpha) {
    const Ai = inverse(m.A);
    return { mean: dot(mv(Ai, m.b), x), bonus: alpha * Math.sqrt(Math.max(0, dot(x, mv(Ai, x)))) };
}
/**
 * Learn from feedback. First time for a blend: add the sample. If the same blend is re-rated,
 * pass the earlier reward so the old feedback is replaced instead of double-counted.
 */
function learn(m, x, reward, previous) {
    const A = m.A.map((r) => [...r]);
    const b = [...m.b];
    if (previous === undefined) {
        for (let i = 0; i < x.length; i++)
            for (let j = 0; j < x.length; j++)
                A[i][j] += x[i] * x[j];
        for (let i = 0; i < x.length; i++)
            b[i] += reward * x[i];
        return { n: m.n + 1, A, b };
    }
    for (let i = 0; i < x.length; i++)
        b[i] += (reward - previous) * x[i];
    return { n: m.n, A, b };
}






/** Round shares to multiples of 5 that sum to exactly 100 (largest remainder). */
function roundShares(raw) {
    const sum = raw.reduce((a, b) => a + b, 0) || 1;
    const units = raw.map((r) => (r / sum) * 20);
    const base = units.map(Math.floor);
    let left = 20 - base.reduce((a, b) => a + b, 0);
    const order = units.map((u, i) => ({ i, f: u - Math.floor(u) })).sort((a, b) => b.f - a.f);
    for (const o of order) {
        if (left <= 0)
            break;
        base[o.i] += 1;
        left -= 1;
    }
    return base.map((b) => b * 5);
}

const REC_CFG = {'cand': 6, 'gain': 4, 'ramp': 5, 'alpha': 0.35, 'bonus': 0.6};
const clamp3 = (v) => Math.max(0, Math.min(3, v));
const ZERO_PREFS = { pa: 0, pb: 0, ps: 0, pr: 0 };
let _prefs = ZERO_PREFS;
/** What a user can tell Hadota after tasting. Each tag moves one learned taste offset (in "levels", half a level at a time). */
const FEEDBACK_TAGS = [
    { id: 'too-acidic', ar: 'حامضة زيادة', d: { pa: -0.5 } },
    { id: 'not-bright', ar: 'مش حامضة كفاية', d: { pa: 0.5 } },
    { id: 'too-heavy', ar: 'تقيلة زيادة', d: { pb: -0.5 } },
    { id: 'too-light', ar: 'خفيفة زيادة', d: { pb: 0.5 } },
    { id: 'too-bitter', ar: 'مُرّة أو محروقة', d: { pr: -0.5 } },
    { id: 'too-pale', ar: 'باهتة ومش غامقة كفاية', d: { pr: 0.5 } },
    { id: 'too-sweet', ar: 'حلوة زيادة', d: { ps: -0.5 } },
    { id: 'not-sweet', ar: 'مش حلوة كفاية', d: { ps: 0.5 } },
    { id: 'perfect', ar: 'مظبوطة بالظبط', d: {} },
];
const PREF_LIMIT = 1.5;
/** New offsets after the user picked tags. Offsets stay within +-1.5 levels so one bad day cannot wreck a profile. */
function applyFeedback(prefs, tagIds) {
    const p = { ...ZERO_PREFS, ...(prefs || {}) };
    for (const id of tagIds || []) {
        const t = FEEDBACK_TAGS.find((x) => x.id === id);
        if (!t) continue;
        for (const k of Object.keys(t.d)) p[k] = Math.max(-PREF_LIMIT, Math.min(PREF_LIMIT, p[k] + t.d[k]));
    }
    return p;
}
const _norm = (s) => String(s || '').replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
const TEXT_RULES = [
    ['not-bright', /(مش|مفيش|ناقصها|قليلة)\s*(حموض|حامض)/],
    ['too-acidic', /(حامض|حموضه عاليه|حموضتها|لاذع|بتحرق)/],
    ['not-sweet', /(مش|مفيش)\s*(حلو|سكر)|ناقصها (سكر|حلاوه)|عايزها احلي/],
    ['too-sweet', /(حلو|سكر)\S*\s*(زياده|اوي|جدا)|سكرانه|سكرها كتير/],
    ['too-bitter', /محروق|حارق|(^|\s)(مر|مره)\s*(اوي|زياده|جدا|شويه)|طعم الحرق/],
    ['too-pale', /باهته|فاتحه اوي|مش غامق/],
    ['too-heavy', /(تقيل|تخين)\S*\s*(زياده|اوي|جدا)?|تقيله/],
    ['too-light', /خفيف\S*\s*(زياده|اوي|جدا)|زي الميه|مش مركز/],
    ['perfect', /مظبوط|تحفه|جامد|عجبتني|بالظبط/],
];
/** Rough Arabic keyword reading of a free-text opinion. It is a heuristic: it only ever produces tags the user could have tapped. */
function tagsFromText(text) {
    const t = _norm(text), out = [];
    for (const [id, re] of TEXT_RULES) if (re.test(t) && !out.includes(id)) out.push(id);
    if (out.includes('not-bright')) out.splice(out.indexOf('too-acidic'), out.includes('too-acidic') ? 1 : 0);
    if (out.includes('not-sweet') && out.includes('too-sweet')) out.splice(out.indexOf('too-sweet'), 1);
    return out;
}
const FAMILY_OF = new Map(FLAVORS.map((f) => [f.id, f.family]));
const ROAST_ORDER = ['light', 'medium', 'mediumdark', 'dark'];
function targetAcidity(a, d, flavors) { return clamp3(targetAcidity0(a, d, flavors) + _prefs.pa); }
function targetAcidity0(a, d, flavors) {
    const ans = one(a, 'acidity');
    if (ans === 'soft')
        return 0.5;
    if (ans === 'balanced')
        return 2;
    if (ans === 'bright')
        return 3;
    if (d.family === 'traditional')
        return 0.5;
    if (d.milkMl > 20)
        return 1;
    const fams = flavors.map((f) => FAMILY_OF.get(f));
    const bright = fams.filter((f) => f === 'fruity' || f === 'floral').length;
    return bright > fams.length / 2 ? 3 : 1.5;
}
function targetBody(a, d) { return clamp3(targetBody0(a, d) + _prefs.pb); }
function targetBody0(a, d) {
    const ans = one(a, 'body');
    if (ans === 'silky')
        return 1;
    if (ans === 'medium')
        return 2;
    if (ans === 'heavy')
        return 3;
    if (d.family === 'traditional')
        return 3;
    return { light: 1, medium: 2, strong: 3 }[one(a, 'strength') ?? 'medium'] ?? 2;
}
function pickRoast(a, d, flavors) {
    const r0 = pickRoast0(a, d, flavors), asked = one(a, 'roast');
    if ((asked && asked !== 'auto') || !_prefs.pr) return r0;
    return ROAST_ORDER[Math.max(0, Math.min(3, Math.round(ROAST_ORDER.indexOf(r0) + _prefs.pr)))];
}
function pickRoast0(a, d, flavors) {
    const asked = one(a, 'roast');
    if (asked && asked !== 'auto')
        return asked;
    if (d.family === 'traditional')
        return 'mediumdark';
    const fams = flavors.map((f) => FAMILY_OF.get(f));
    const n = (x) => fams.filter((f) => f === x).length;
    let r = 1; // medium
    if (n('fruity') + n('floral') > n('roasted') + n('spices'))
        r = 0;
    if (n('roasted') + n('spices') > n('fruity') + n('floral'))
        r = 2;
    if (n('roasted') >= 2)
        r = 3;
    if (d.milkMl >= 100 && r < 2)
        r += 1; // milk drinks need more roast to stand up to milk
    if (one(a, 'serve') === 'iced' && d.id.startsWith('cold-brew') && r === 0)
        r = 1;
    return ROAST_ORDER[Math.min(3, r)];
}
function scoreBean(b, a, d, roast) {
    const flavors = many(a, 'flavor');
    const aroma = many(a, 'aroma');
    let s = 0;
    s += 3 - Math.abs(b.acidity - targetAcidity(a, d, flavors)) * 1.2;
    s += 3 - Math.abs(b.body - targetBody(a, d));
    s += Math.min(3, flavors.filter((f) => b.notes.includes(f)).length) * 2.2;
    s += aroma.filter((f) => b.aroma.includes(f)).length * 1.2;
    if (b.roasts.includes(roast))
        s += 1.2;
    const caf = one(a, 'caffeine');
    if (caf === 'gentle')
        s += (3 - b.caffeine) * 0.8;
    if (caf === 'kick')
        s += b.caffeine * 0.9;
    const origin = one(a, 'origin');
    if (origin && ['africa', 'americas', 'asia', 'arabia'].includes(origin) && b.region === origin)
        s += 3.5;
    if (origin === 'species' && b.species === one(a, 'species'))
        s += 6;
    if (d.milkMl >= 100 && b.body >= 2)
        s += 0.8;
    if (_prefs.ps)
        s += 3 - Math.abs(b.sweet - clamp3(2 + _prefs.ps)) * 0.8;
    return s;
}
function blendFrom(lead, rest, lo) {
    const top = [lead, ...rest];
    const shares = roundShares(top.map((t) => (t.s - lo + 1) ** 2));
    return top
        .map((t, i) => ({ bean: t.b, percent: shares[i] }))
        .filter((x) => x.percent > 0)
        .sort((x, y) => y.percent - x.percent);
}
const ROAST_N = ROAST_ORDER.length - 1;
/** Context vector of a blend: taste levels, aroma-family shares and roast (12 numbers, all 0..1). No constant term, so the model compares blends rather than just reflecting overall mood. */
function featuresOf(blend, roast) {
    const w = (f) => blend.reduce((s, p) => s + f(p.bean) * p.percent, 0) / 100 / 3;
    const fam = FAMILIES.map((f) => blend.reduce((s, p) => s + (p.bean.aroma.includes(f.id) ? p.percent : 0), 0) / 100);
    return [w((b) => b.acidity), w((b) => b.body), w((b) => b.sweet), w((b) => b.caffeine), ...fam, ROAST_ORDER.indexOf(roast) / ROAST_N];
}
/**
 * Candidate blends are ranked by taste match; if the user has a personal model (LinUCB-style
 * contextual bandit trained on their ratings) it re-ranks them: rewards what they liked, penalises
 * what they did not, and adds an exploration bonus for unfamiliar styles.
 */
function recommendBlend(a, d, roast, model) {
    const scored = BEANS.map((b) => ({ b, s: scoreBean(b, a, d, roast) })).sort((x, y) => y.s - x.s);
    const lo = scored[scored.length - 1].s;
    const cands = scored.slice(0, REC_CFG.cand).map((lead, i) => {
        const rest = scored.slice(i + 1, i + 3); // sliding windows: candidates use genuinely different beans
        const blend = blendFrom(lead, rest, lo);
        const base = blend.reduce((s, p) => s + (scored.find((q) => q.b.id === p.bean.id)?.s ?? 0) * p.percent, 0) / 100;
        return { blend, base };
    });
    const bases = cands.map((c) => c.base);
    const span = Math.max(...bases) - Math.min(...bases) + 1e-6;
    const tw = model ? trust(model.n) : 0;
    const st = cands.map((c) => (model && tw > 0 ? stats(model, featuresOf(c.blend, roast), REC_CFG.alpha) : { mean: 0, bonus: 0 }));
    const avg = st.reduce((s, x) => s + x.mean, 0) / st.length; // compare blends with each other, not with the user's overall mood
    const ranked = cands.map((c, i) => {
        const norm = (c.base - Math.min(...bases)) / span;
        return { i, score: norm + tw * (REC_CFG.gain * (st[i].mean - avg) + REC_CFG.bonus * st[i].bonus) };
    }).sort((x, y) => y.score - x.score);
    return { blend: cands[ranked[0].i].blend, explored: ranked[0].i !== 0 };
}
const GRIND = { ibrik: 'extrafine', espresso: 'fine', moka: 'medfine', aeropress: 'medfine', french: 'coarse', pourover: 'medium', coldbrew: 'coarse', phin: 'medfine' };
function doseFor(method, d, a) {
    const strength = one(a, 'strength') ?? 'medium';
    let shots = Math.max(1, d.shots || 1);
    if (d.family === 'espresso') {
        shots = Math.min(3, Math.max(1, shots + (strength === 'strong' ? 1 : 0) - (strength === 'light' && shots > 1 ? 1 : 0)));
        if (many(a, 'addons').includes('extra-shot'))
            shots = Math.min(3, shots + 1);
    }
    const k = { light: 0.9, medium: 1, strong: 1.15 }[strength] ?? 1;
    const r1 = (n) => Math.round(n * 10) / 10;
    switch (method) {
        case 'ibrik': return { grams: r1(7 * k), waterMl: 70, tempC: null, minutes: 3, shots: 1 };
        case 'espresso': return { grams: 9 * shots, waterMl: 30 * shots, tempC: 93, minutes: 0.5, shots };
        case 'moka': return { grams: r1(8 * shots), waterMl: 56 * shots, tempC: null, minutes: 4, shots };
        case 'aeropress': return { grams: r1(7.5 * shots), waterMl: 50 * shots, tempC: 90, minutes: 2, shots };
        case 'french': return { grams: r1(15 * k), waterMl: 240, tempC: 94, minutes: 4, shots: 1 };
        case 'pourover': return { grams: r1(15 * k), waterMl: 240, tempC: 94, minutes: 3, shots: 1 };
        case 'coldbrew': return { grams: r1(40 * k), waterMl: 320, tempC: null, minutes: 840, shots: 1 };
        case 'phin': return { grams: r1(20 * k), waterMl: 100, tempC: 92, minutes: 5, shots: 1 };
    }
}
const TSP = { none: 0, light: 0.5, medium: 1, sweet: 2 };
function recommend(a, model, prefs) {
    _prefs = { ...ZERO_PREFS, ...(prefs || {}) };
    const d = drinkById(one(a, 'drink') ?? '');
    const method = one(a, 'gear');
    if (!d || !method)
        return undefined;
    const flavors = many(a, 'flavor');
    const roast = pickRoast(a, d, flavors);
    const { blend, explored } = recommendBlend(a, d, roast, model);
    const w = (f) => Math.round(blend.reduce((s, p) => s + f(p.bean) * p.percent, 0) / 100);
    const wantedNotes = flavors.filter((f) => blend.some((p) => p.bean.notes.includes(f)));
    const blendNotes = blend.flatMap((p) => p.bean.notes);
    const notes = [...new Set([...wantedNotes, ...blendNotes])].slice(0, 5);
    const level = one(a, 'sweetness') ?? 'none';
    return {
        drink: d,
        serve: one(a, 'serve') ?? 'hot',
        method,
        blend,
        roast,
        grind: GRIND[method],
        dose: doseFor(method, d, a),
        milk: d.milkMl > 0 ? { id: one(a, 'milk') ?? 'whole', ml: d.milkMl } : undefined,
        sweetness: { level, sweetener: one(a, 'sweetener'), tsp: TSP[level] ?? 0 },
        addons: many(a, 'addons').filter((x) => x !== 'none'),
        profile: { acidity: w((b) => b.acidity), body: w((b) => b.body), sweet: w((b) => b.sweet) },
        aroma: [...new Set(blend.flatMap((p) => p.bean.aroma))].slice(0, 3),
        notes,
        x: featuresOf(blend, roast),
        explored,
        learnedFrom: model?.n ?? 0,
        prefs: _prefs,
    };
}
const speciesOf = (r) => [...new Set(r.blend.map((p) => p.bean.species))];




const keyed = (q, ids) => ids.map((id) => ({ id, key: `q.${q}.${id}` }));
const drinkOf = (a) => {
    const id = one(a, 'drink');
    return id ? drinkById(id) : undefined;
};
const blackish = (d) => !!d && (d.family === 'brewed' ? d.milkMl === 0 : d.family === 'espresso' && d.milkMl <= 20);
const QUESTIONS = [
    { id: 'serve', when: () => true, options: () => keyed('serve', ['hot', 'iced']) },
    {
        id: 'drink',
        when: (a) => !!one(a, 'serve'),
        options: (a) => DRINKS.filter((d) => d.serve.includes(one(a, 'serve'))).map((d) => ({ id: d.id, label: d.name })),
    },
    {
        id: 'gear',
        when: (a) => !!drinkOf(a),
        options: (a) => (drinkOf(a)?.methods ?? []).map((m) => ({ id: m, label: METHOD_NAMES[m] })),
    },
    { id: 'strength', when: (a) => !!drinkOf(a) && drinkOf(a).family !== 'traditional', options: () => keyed('strength', ['light', 'medium', 'strong']) },
    { id: 'acidity', when: (a) => blackish(drinkOf(a)), options: () => keyed('acidity', ['soft', 'balanced', 'bright', 'any']) },
    { id: 'body', when: (a) => blackish(drinkOf(a)), options: () => keyed('body', ['silky', 'medium', 'heavy', 'any']) },
    {
        id: 'aroma', multi: true, max: 3,
        when: (a) => !!drinkOf(a) && drinkOf(a).family !== 'traditional',
        options: () => [...FAMILIES.map((f) => ({ id: f.id, label: f.name })), { id: 'any', key: 'q.aroma.any' }],
    },
    {
        id: 'flavor', multi: true, max: 4,
        when: (a) => many(a, 'aroma').length > 0,
        options: (a) => {
            const fams = many(a, 'aroma').filter((f) => f !== 'any');
            const pool = fams.length ? FLAVORS.filter((f) => fams.includes(f.family)) : FLAVORS.filter((f) => f.family === 'sweet' || f.family === 'nutty-cocoa');
            return pool.map((f) => ({ id: f.id, label: f.name }));
        },
    },
    { id: 'milk', when: (a) => (drinkOf(a)?.milkMl ?? 0) > 0, options: () => MILKS.map((m) => ({ id: m.id, label: m.name })) },
    { id: 'sweetness', when: (a) => !!drinkOf(a), options: () => keyed('sweetness', ['none', 'light', 'medium', 'sweet']) },
    {
        id: 'sweetener',
        when: (a) => !!one(a, 'sweetness') && one(a, 'sweetness') !== 'none',
        options: (a) => SWEETENERS.filter((s) => s.id !== 'condensed' || (drinkOf(a)?.milkMl ?? 0) > 0 || drinkOf(a)?.id === 'phin').map((s) => ({ id: s.id, label: s.name })),
    },
    {
        id: 'addons', multi: true, max: 6,
        when: (a) => !!drinkOf(a),
        options: (a) => { const o = addonsFor(a).map((x) => ({ id: x.id, label: x.name })); o.push({ id: 'none', key: 'q.addons.none' }); return o; },
    },
    { id: 'roast', when: (a) => !!drinkOf(a) && drinkOf(a).family !== 'traditional', options: () => keyed('roast', ['light', 'medium', 'mediumdark', 'dark', 'auto']) },
    { id: 'caffeine', when: (a) => !!drinkOf(a), options: () => keyed('caffeine', ['normal', 'gentle', 'kick']) },
];
/** Add-ons depend on the drink: traditional coffee takes spices only; milk drinks get everything. */
function addonsFor(a) {
    const d = drinkOf(a);
    const iced = one(a, 'serve') === 'iced';
    if (!d)
        return [];
    return ADDONS.filter((x) => {
        if (x.iced && !iced)
            return false;
        if (x.group === 'spice' && x.id !== 'rose-water' && x.id !== 'orange-blossom') return false;
        if (d.family === 'traditional') return x.id === 'rose-water' || x.id === 'orange-blossom';
        if (x.id === 'vanilla-ice-cream')
            return d.id === 'affogato' || iced;
        if (x.id === 'extra-shot')
            return d.family === 'espresso' || d.id.startsWith('cold-brew');
        if (d.milkMl === 0 && (x.group === 'topping' || x.group === 'sauce'))
            return x.id === 'whipped-cream' && d.id === 'con-panna';
        return true;
    });
}
/** The next question for these answers, skipping questions with a single possible option (auto-answered). */
function nextQuestion(a) {
    let cur = { ...a };
    for (let guard = 0; guard < QUESTIONS.length + 1; guard++) {
        const q = QUESTIONS.find((x) => x.when(cur) && cur[x.id] === undefined);
        if (!q)
            return { answers: cur };
        const opts = q.options(cur);
        if (q.id === 'addons' && opts.length <= 1) { cur = { ...cur, addons: ['none'] }; continue; }
        if (opts.length === 1 && !q.multi) {
            cur = { ...cur, [q.id]: opts[0].id };
            continue;
        }
        return { question: q, answers: cur };
    }
    return { answers: cur };
}

