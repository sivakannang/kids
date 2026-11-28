/* =========================================================
   Which continent is each country on the world map in? (names as in countries-110m.js)
   window.CONTINENTS = { Asia: { e, c, info }, … };  window.CONTINENT_OF(name) → 'Asia'
   ========================================================= */
(function () {
  const LIST = {
    'Asia': 'Kazakhstan|Uzbekistan|Indonesia|Russia*|Timor-Leste|Israel|Lebanon|Palestine|Jordan|United Arab Emirates|Qatar|Kuwait|Iraq|Oman|Cambodia|Thailand|Laos|Myanmar|Vietnam|North Korea|South Korea|Mongolia|India|Bangladesh|Bhutan|Nepal|Pakistan|Afghanistan|Tajikistan|Kyrgyzstan|Turkmenistan|Iran|Syria|Armenia|Turkey|Sri Lanka|China|Taiwan|Azerbaijan|Georgia|Philippines|Malaysia|Brunei|Japan|Yemen|Saudi Arabia|N. Cyprus|Cyprus',
    'Europe': 'Norway|France|Sweden|Belarus|Ukraine|Poland|Austria|Hungary|Moldova|Romania|Lithuania|Latvia|Estonia|Germany|Bulgaria|Greece|Albania|Croatia|Switzerland|Luxembourg|Belgium|Netherlands|Portugal|Spain|Ireland|Italy|Denmark|United Kingdom|Iceland|Slovenia|Finland|Slovakia|Czechia|Bosnia and Herz.|Macedonia|Serbia|Montenegro|Kosovo',
    'Africa': 'Tanzania|W. Sahara|Dem. Rep. Congo|Somalia|Kenya|Sudan|Chad|South Africa|Lesotho|Zimbabwe|Botswana|Namibia|Senegal|Mali|Mauritania|Benin|Niger|Nigeria|Cameroon|Togo|Ghana|Côte d\'Ivoire|Guinea|Guinea-Bissau|Liberia|Sierra Leone|Burkina Faso|Central African Rep.|Congo|Gabon|Eq. Guinea|Zambia|Malawi|Mozambique|eSwatini|Angola|Burundi|Madagascar|Gambia|Tunisia|Algeria|Eritrea|Morocco|Egypt|Libya|Ethiopia|Djibouti|Somaliland|Uganda|Rwanda|S. Sudan',
    'North America': 'Canada|United States of America|Haiti|Dominican Rep.|Bahamas|Greenland|Mexico|Panama|Costa Rica|Nicaragua|Honduras|El Salvador|Guatemala|Belize|Puerto Rico|Jamaica|Cuba|Trinidad and Tobago',
    'South America': 'Argentina|Chile|Falkland Is.|Uruguay|Brazil|Bolivia|Peru|Colombia|Venezuela|Guyana|Suriname|Ecuador|Paraguay',
    'Australia & Oceania': 'Fiji|Papua New Guinea|Vanuatu|New Caledonia|Solomon Is.|New Zealand|Australia',
    'Antarctica': 'Antarctica|Fr. S. Antarctic Lands',
  };
  const OF = {};
  for (const [c, s] of Object.entries(LIST)) s.split('|').forEach(n => { OF[n.replace('*', '')] = c; });
  window.CONTINENT_OF = n => OF[n] || null;
  window.CONTINENTS = {
    'Asia': { e: '🐘', c: '#ff9f1c', info: 'The biggest continent, with the most people. India is here!' },
    'Europe': { e: '🏰', c: '#9b5de5', info: 'A small continent with lots of countries, castles and old cities.' },
    'Africa': { e: '🦁', c: '#f4a261', info: 'Home of lions, elephants, the Sahara desert and the River Nile.' },
    'North America': { e: '🦅', c: '#ef476f', info: 'Canada, the USA and Mexico are here, plus giant Greenland.' },
    'South America': { e: '🦜', c: '#06d6a0', info: 'Home of the Amazon rainforest, the biggest rainforest in the world.' },
    'Australia & Oceania': { e: '🦘', c: '#118ab2', info: 'Australia and thousands of islands in the Pacific Ocean. Kangaroos live here!' },
    'Antarctica': { e: '🐧', c: '#cfd8ff', info: 'The coldest place on Earth, covered in ice. Penguins live here, but no towns!' },
  };
})();
