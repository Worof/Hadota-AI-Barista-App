import { l, type FamilyId, type L, type Roast } from './catalog';

export type Species = 'arabica' | 'robusta' | 'liberica' | 'excelsa';
export type Region = 'africa' | 'americas' | 'asia' | 'arabia';
export type Level = 0 | 1 | 2 | 3;

export interface Bean {
  id: string;
  species: Species;
  variety: L;
  name: L;
  origin: L;
  region: Region;
  /** 0 soft ... 3 bright */
  acidity: Level;
  /** 0 light ... 3 heavy */
  body: Level;
  sweet: Level;
  caffeine: Level;
  aroma: FamilyId[];
  notes: string[];
  roasts: Roast[];
}

/**
 * Profiles are typical regional/varietal tendencies (SCA flavor families, public roaster guides),
 * not lab data. Confirm stock and sourcing per lot before promising a specific bean.
 * Excelsa is classed as a variety of Liberica (reclassified 2006) but sold as its own bean type.
 */
export const BEANS: Bean[] = [
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
