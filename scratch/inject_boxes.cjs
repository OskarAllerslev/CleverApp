const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'src', 'content', 'docs');

const mdxData = {
  // 1. Analytisk Plangeometri
  'analytisk-plangeometri/afstande': {
    overview: [
      'Beregning af afstanden mellem to punkter i et koordinatsystem ved hjælp af afstandsformlen.',
      'Beregning af den vinkelrette afstand fra et punkt til en linje (dist-formlen).',
      'Bestemmelse af midtpunktet for et linjestykke mellem to punkter.'
    ],
    motivation: 'Afstandsformler bruges konstant i computerspil og grafikmotorer til kollisionsdetektion (fx om en karakter rammer en mur eller fjende) og i GPS-navigationssystemer til at beregne den korteste geografiske rute mellem to punkter.'
  },
  'analytisk-plangeometri/cirklens-ligning': {
    overview: [
      'Opstilling og forståelse af cirklens standardligning: $(x-a)^2 + (y-b)^2 = r^2$.',
      'Aflæsning af cirklens centrum $(a, b)$ og radius $r$ ud fra dens ligning.',
      'Omskrivning af andengradsligninger til cirklens standardform ved hjælp af kvadratkomplettering.'
    ],
    motivation: 'Cirklens ligning er fundamental i computergrafik til at tegne cirkulære former, i radioteknologi til at beregne dækningsområdet for master, og i astronomi til at lave indledende modeller for planetbaner.'
  },
  'analytisk-plangeometri/linjens-ligning': {
    overview: [
      'Opstilling af linjens ligning på standardform: $ax + by + c = 0$.',
      'Forståelse af linjens ligning på hældningsform: $y = ax + b$.',
      'Bestemmelse af skæringspunkter mellem linjer og koordinatakser.'
    ],
    motivation: 'Linjens ligning bruges til at beregne lineære tendenser (fx priskurver eller vækstrate), i kortsoftware til at modellere veje, samt i raytracing-teknologi til at simulere lysstrålers rette linjer i 3D-animationer.'
  },

  // 2. Avanceret Statistik
  'avanceret-statistik/binomialfordeling': {
    overview: [
      'Beregning af sandsynligheder ved hjælp af binomialformlen: $P(X=r) = \\binom{n}{r} p^r (1-p)^{n-r}$.',
      'Forståelse af betingelserne for et binomialt eksperiment (succes/fiasko, uafhængighed).',
      'Beregning af middelværdi $\\mu = n \\cdot p$ og spredning $\\sigma = \\sqrt{n \\cdot p \\cdot (1-p)}$.'
    ],
    motivation: 'Binomialfordelingen bruges af medicinalvirksomheder til at teste effektiviteten og bivirkningsrisikoen for ny medicin på en stikprøve, og af fabrikker til at estimere fejlrater i store varepartier baseret på stikprøver.'
  },
  'avanceret-statistik/hypotesetest': {
    overview: [
      'Opstilling af nulhypotese ($H_0$) og alternativ hypotese ($H_1$).',
      'Fastlæggelse af signifikansniveau og beregning af test sandsynligheder (p-værdi).',
      'Udførelse af $\\chi^2$-test (chi-i-anden-test) til at teste uafhængighed mellem to variable.'
    ],
    motivation: 'Hypotesetests er rygraden i al moderne videnskab. De bruges til at afgøre, om en observeret effekt er en reel opdagelse eller bare statistisk støj – fx om en webshops nye layout faktisk øger salget, eller om en ny medicin virker.'
  },

  // 3. Funktioner
  'funktioner/andengradspolynomier': {
    overview: [
      'Forståelse af andengradspolynomiets forskrift: $f(x) = ax^2 + bx + c$.',
      'Beregning af diskriminanten $d = b^2 - 4ac$ og dens betydning for antallet af rødder.',
      'Bestemmelse af parablens toppunkt ved hjælp av toppunktsformlen: $T = (-\\frac{b}{2a}, -\\frac{d}{4a})$.'
    ],
    motivation: 'Andengradspolynomier beskriver den parabolske bue, som et kastet objekt eller et projektil følger under påvirkning af tyngdekraften. De bruges af ingeniører til at designe hængebroer og af arkitekter til at optimere parabolantenner, så de samler signaler mest effektivt.'
  },
  'funktioner/eksponentiel-og-potens': {
    overview: [
      'Eksponentielle funktioner $y = b \\cdot a^x$ og potensfunktioner $y = b \\cdot x^a$.',
      'Bestemmelse af fordoblingskonstant $T_2$ og halveringskonstant $T_{1/2}$.',
      'Anvendelse af procentvise ændringer og vækstrater i praktiske modeller.'
    ],
    motivation: 'Eksponentiel vækst bruges til at modellere vild virusspredning (fx under pandemier), bakterievækst og rentes rente. Potensfunktioner bruges til at beskrive fysiske love, såsom forholdet mellem dyrs vægt og deres energibehov.'
  },
  'funktioner/funktionsbegrebet': {
    overview: [
      'Definitionen af en funktion som en entydig sammenhæng mellem input og output.',
      'Bestemmelse af definitionsmængde ($Dm$) og værdimængde ($Vm$).',
      'Grafisk aflæsning af funktioner, rødder og skæringspunkter.'
    ],
    motivation: 'Funktioner er matematiske maskiner, der tager et input og giver et output. Det er selve fundamentet for al softwareprogrammering (funktioner i kode) og bruges til at bygge alle matematiske modeller af virkeligheden.'
  },
  'funktioner/lineaere-funktioner': {
    overview: [
      'Forståelse af den lineære forskrift: $y = ax + b$.',
      'Beregning af hældningskoefficienten $a$ ud fra to punkter på en ret linje.',
      'Tolkning af $a$ som vækstrate og $b$ som begyndelsesværdi/skæring.'
    ],
    motivation: 'Lineære funktioner beskriver konstante ændringer i virkeligheden. De bruges af virksomheder til at beregne abonnementspriser (fast gebyr $b$ + pris pr. forbrug $a$), af bilister til at estimere kørselstid, og til at lave simple forudsigelser.'
  },
  'funktioner/regression': {
    overview: [
      'Gennemgang af lineær, eksponentiel og potensregression ud fra datamateriale.',
      'Tolkning af determinationskoefficienten $R^2$ (forklaringsgraden).',
      'Analyse af residualer til at vurdere modellens anvendelighed.'
    ],
    motivation: 'Regression er fundamentet for moderne kunstig intelligens og maskinlæring (Data Science). Det er metoden, man bruger til at finde mønstre i store mængder historisk data og bruge dem til at forudsige fremtiden, fx boligpriser.'
  },

  // 4. Geometri og Trigonometri
  'geometri-og-trigonometri/ensvinklede-trekanter': {
    overview: [
      'Forståelse af ensvinklede (ligedannede) trekanter og deres egenskaber.',
      'Beregning af skaleringsfaktoren (skalaforholdet) $k$ mellem to trekanter.',
      'Bestemmelse af ukendte sidelængder ved hjælp af ensliggende sider.'
    ],
    motivation: 'Ensvinklede trekanter gør det muligt at opmåle utilgængelige højder og afstande (fx højden af en pyramide eller bredden af en flod) blot ved at sammenligne mindre, målbare skygger eller trekanter på jorden.'
  },
  'geometri-og-trigonometri/pythagoras': {
    overview: [
      'Anvendelse af Pythagoras\' læresætning: $a^2 + b^2 = c^2$ i retvinklede trekanter.',
      'Identifikation af kateter og hypotenuse i en retvinklet trekant.',
      'Matematisk bevis for sætningen ud fra geometriske arealer.'
    ],
    motivation: 'Pythagoras\' sætning er måske den mest berømte og anvendte matematiske formel overhovedet. Håndværkere bruger den til at sikre, at hjørner er præcis $90^\\circ$ (3-4-5 reglen), og spiludviklere bruger den til at beregne afstande i 3D-rum.'
  },
  'geometri-og-trigonometri/sinus-cosinus-tan': {
    overview: [
      'Definitioner af sinus, cosinus og tangens i retvinklede trekanter.',
      'Beregning af vinkler og sidelængder ved hjælp af de trigonometriske grundformler.',
      'Forståelse af enhedscirklen og dens sammenhæng med de trigonometriske funktioner.'
    ],
    motivation: 'Trigonometri bruges til at modellere periodiske bølger som lyd, lys og havbølger. Det er rygraden i al trådløs teknologi (WiFi, 5G), musikkodning og animationer, der skal simulere bløde, naturlige bevægelser.'
  },
  'geometri-og-trigonometri/trekantsberegninger': {
    overview: [
      'Anvendelse af sinusrelationerne til beregninger i vilkårlige trekanter.',
      'Anvendelse af cosinusrelationerne til beregning af ukendte sider og vinkler.',
      'Beregning af trekantens areal ud fra to sider og den mellemliggende vinkel.'
    ],
    motivation: 'Trekantsberegninger bruges til triangulation i GPS-satellitsystemer for at bestemme din præcise position på jorden, og af arkitekter til at designe stærke og stabile stål- og trækonstruktioner (spær).'
  },

  // 5. Infinitesimalregning
  'infinitesimalregning/differentialkvotient': {
    overview: [
      'Forståelse af differentialkvotienten $f\'(x)$ som hældningen af tangenten i et punkt.',
      'Anvendelse af standardformler for at differentiere potens-, eksponentiel- og logaritmefunktioner.',
      'Brug af regneregler for differentiering (sumreglen, differensreglen og produktreglen).'
    ],
    motivation: 'Differentialregning beskriver, hvordan ting ændrer sig over tid. Fysikere bruger det til at beregne hastighed og acceleration, og økonomer bruger det til at finde den marginale omkostning og optimere prissætningen på varer.'
  },
  'infinitesimalregning/optimering-og-monotoni': {
    overview: [
      'Bestemmelse af monotoniforhold (hvor funktionen er voksende eller aftagende).',
      'Lokalisering af lokale og globale ekstrema (maksimum- og minimumspunkter) ved $f\'(x) = 0$.',
      'Løsning af praktiske optimeringsproblemer inden for geometri og økonomi.'
    ],
    motivation: 'Optimering styrer verden. Virksomheder bruger monotonianalyse to at finde den helt præcise produktion, der giver den maksimale profit, og ingeniører bruger det til at designe emballage med mindst muligt spildmateriale.'
  },
  'infinitesimalregning/tretrinsreglen': {
    overview: [
      'Trin 1: Opsætning af funktionstilvæksten (sekantens tæller): $\\Delta y = f(x_0+\\Delta x) - f(x_0)$.',
      'Trin 2: Opstilling af differenskvotienten (sekantens hældning): $\\frac{\\Delta y}{\\Delta x}$.',
      'Trin 3: Bestemmelse af grænseværdien for $\\Delta x \\to 0$ for at finde tangentens hældning (differentialkvotienten).'
    ],
    motivation: 'Tretrinsreglen er broen mellem gennemsnit og øjeblik. Den forklarer teoretisk, hvordan vi går fra at måle en gennemsnitshastighed over en time til at måle den nøjagtige hastighed på et splitsekund (fx hvad bilens speedometer viser).'
  },

  // 6. Matematik A - Avanceret Infinitesimalregning
  'matematik-a/avanceret-infinitesimalregning/graensevaerdier-og-kontinuitet': {
    overview: [
      'Forståelse af grænseværdi-begrebet: $\\lim_{x \\to x_0} f(x) = L$.',
      'Definitionen på en kontinuerlig funktion (en ubrudt kurve uden huller eller spring).',
      'Forbindelsen mellem kontinuitet og differentiabilitet.'
    ],
    motivation: 'Grænseværdier er det matematiske værktøj, der lader os arbejde med uendelighed og division med nul uden at crashe systemet. Det bruges i fysik til at analysere sorte huller og i computer science til at måle algoritmers effektivitet.'
  },
  'matematik-a/avanceret-infinitesimalregning/integrationsregneregler': {
    overview: [
      'Forståelse af det ubestemte integral $\\int f(x) dx$ som bestemmelse av stamfunktioner.',
      'Anvendelse af grundlæggende integrationsregler (potens-, eksponentiel- og logaritmefunktioner).',
      'Brug af regneregler for integration af sum, differens og konstantmultiplikation.'
    ],
    motivation: 'Integration er det omvendte af differentiering. Det gør det muligt at regne baglæns – fx hvis en sensor måler din acceleration, kan integration genopbygge din præcise hastighed og position over tid.'
  },
  'matematik-a/avanceret-infinitesimalregning/omdrejningslegemer': {
    overview: [
      'Beregning af rumfang (volumen) for omdrejningslegemer roteret $360^\\circ$ om x-aksen.',
      'Anvendelse af volumenformlen: $V = \\pi \\int_{a}^{b} (f(x))^2 dx$.',
      'Integration af plane områder begrænset af to kurver (areal mellem grafer).'
    ],
    motivation: 'Omdrejningslegemer bruges af 3D-designere og maskiningeniører til at beregne vægten, materialeforbruget og volumenet af symmetriske objekter som flasker, vaser, rør, stempler i bilmotorer og arkitektoniske søjler.'
  },
  'matematik-a/avanceret-infinitesimalregning/substitution': {
    overview: [
      'Forståelse af integrationsmetoden integration ved substitution (variabelskift).',
      'Identifikation af den "indre funktion" $u = g(x)$ og dens afledte $du = g\'(x)dx$.',
      'Metoder til at ændre integrationsgrænserne ved bestemte integraler under substitution.'
    ],
    motivation: 'Substitutionsreglen er integrationens svar på kædereglen. Den bruges til at løse ellers uløselige, komplekse integraler i kvantemekanik, fluidmekanik (hvordan væsker strømmer) og i avancerede finansielle risikomodeller.'
  },

  // 7. Matematik A - Avanceret Statistik og Sandsynlighed
  'matematik-a/avanceret-statistik-og-sandsynlighed/intervalsandsynlighed': {
    overview: [
      'Beregning af sandsynligheder for at ramme inden for specifikke intervaller under en fordeling.',
      'Beregning og tolkning af konfidensintervaller for stikprøve-proportioner og middelværdier.',
      'Betydningen af konfidensniveau (fx 95%) og fejlmargin.'
    ],
    motivation: 'Konfidensintervaller bruges af politiske analytikere i meningsmålinger til at angive den statistiske usikkerhed (fx "Partiet står til 24% $\\pm$ 2%"), og i videnskabelig forskning til at bevise, at forsøgsresultater er pålidelige.'
  },
  'matematik-a/avanceret-statistik-og-sandsynlighed/normalfordeling-taethed': {
    overview: [
      'Forståelse af normalfordelingens tæthedsfunktion: $f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}$.',
      'Betydningen af middelværdien $\\mu$ og spredningen (standardafvigelsen) $\\sigma$.',
      'Beregning af sandsynligheder ved hjælp af den kumulerede normalfordeling.'
    ],
    motivation: 'Normalfordelingen (klokkekurven) beskriver naturlig variation i verden: menneskers højde, IQ-score og præcisionen af fabriksmaskiner. Den er det absolut vigtigste fundament for al moderne risikovurdering og forsikringsmatematik.'
  },

  // 8. Matematik A - Differentialligninger
  'matematik-a/differentialligninger/eulers-metode': {
    overview: [
      'Forståelse af Eulers numeriske metode til løsning af differentialligninger.',
      'Anvendelse af iterationsformlen: $y_{n+1} = y_n + h \\cdot f(x_n, y_n)$.',
      'Forståelse af skridtlængden $h$ og dens betydning for fejlmargenen.'
    ],
    motivation: 'Mange differentialligninger i virkeligheden kan ikke løses på papir. Eulers metode (og avancerede numeriske varianter) bruges af computere til at køre fysiske simuleringer i realtid, fx bilers affjedring i spil eller vejrudsigter.'
  },
  'matematik-a/differentialligninger/logistisk-vaekst': {
    overview: [
      'Forståelse af den logistiske differentialligning: $\\frac{dy}{dt} = y(b - ay)$ eller $\\frac{dy}{dt} = c \\cdot y \\cdot (M - y)$.',
      'Bestemmelse af bæreevnen (den øvre grænse) $M$.',
      'Anvendelse af den analytiske løsningsfunktion til at forudsige fremtidige tilstande.'
    ],
    motivation: 'Logistisk vækst beskriver biologiske populationer, der vokser under ressourcebegrænsninger (fx fisk i en sø), udbredelsen af rygter på sociale medier, og spredningen af epidemier, der langsomt flader ud.'
  },
  'matematik-a/differentialligninger/opstilling-af-modeller': {
    overview: [
      'Oversættelse af fysiske, biologiske eller økonomiske processer til differentialligninger.',
      'Modellering af sammenhænge, hvor væksthastigheden er proportional med mængden.',
      'Fastlæggelse af randbetingelser og begyndelsesbetingelser for at finde specifikke løsninger.'
    ],
    motivation: 'Opstilling af modeller er kernen i alt videnskabeligt og ingeniørmæssigt arbejde. Det gør det muligt at sætte tal og formler på komplekse systemer som radioaktivt henfald, kroppens optagelse af medicin eller afkøling af kaffe.'
  },
  'matematik-a/differentialligninger/separationsmetoden': {
    overview: [
      'Løsning af første ordens differentialligninger af typen: $\\frac{dy}{dx} = g(x) \\cdot h(y)$.',
      'Separering af de variable på hver sin side af lighedstegnet: $\\frac{1}{h(y)} dy = g(x) dx$.',
      'Integration af begge sider for at finde den fuldstændige analytiske løsning $y(x)$.'
    ],
    motivation: 'Separationsmetoden er et af de mest kraftfulde værktøjer til at finde eksakte formler for virkeligheden. Den bruges bl.a. i fysik til at beskrive frit fald med luftmodstand og i kemi til at beregne hastigheden af kemiske reaktioner.'
  },

  // 9. Matematik A - Vektorer og 3D Geometri
  'matematik-a/vektorer-og-analytisk-geometri/afstande': {
    overview: [
      'Beregning af afstanden fra et punkt til en plan i 3D-rummet.',
      'Beregning af afstanden fra et punkt til en linje i rummet.',
      'Beregning af den vinkelrette afstand mellem to parallelle planer.'
    ],
    motivation: 'Afstande i 3D bruges konstant af spiludviklere til at kode Virtual Reality (VR) og 3D-kollisioner, så spilkarakterer ikke kan gå gennem vægge, og af bygningsingeniører til at lave præcise strukturelle opmålinger.'
  },
  'matematik-a/vektorer-og-analytisk-geometri/kuglens-ligning': {
    overview: [
      'Opstilling og tolkning af kuglens ligning i 3D-rummet: $(x-a)^2 + (y-b)^2 + (z-c)^2 = r^2$.',
      'Bestemmelse af kuglens centrum $(a, b, z)$ og radius $r$ ud fra dens ligning.',
      'Bestemmelse af skæringspunkter mellem en kugle og en linje eller en plan.'
    ],
    motivation: 'Kuglens ligning bruges i 3D-spil til lynhurtig kollisionsdetektion (bounding spheres), i molekylærbiologisk software til at modellere atomstrukturer, samt i astronomi til at beregne stjerners ydre grænser.'
  },
  'matematik-a/vektorer-og-analytisk-geometri/parameterfremstilling-plan-og-rum': {
    overview: [
      'Opstilling af parameterfremstillinger for rette linjer i 3D-rummet.',
      'Opstilling af parameterfremstillinger og ligninger for planer i rummet.',
      'Beregning af skæringspunkter mellem linjer og planer samt vinkler mellem dem.'
    ],
    motivation: 'Parameterfremstillinger bruges i CAD-programmer til at designe 3D-objekter (fx bildele), i animationsfilm til at beskrive karakterers bevægelsesbaner, samt i flystyringssystemer til at kortlægge flyruter i luften.'
  },
  'matematik-a/vektorer-og-analytisk-geometri/skalar-og-krydsprodukt': {
    overview: [
      'Beregning af skalarproduktet (prikproduktet) $\\vec{u} \\cdot \\vec{v}$ og tolkning af ortogonalitet.',
      'Beregning af krydsproduktet (vektorproduktet) $\\vec{u} \\times \\vec{v}$ for at finde en normalvektor.',
      'Beregning af vinkel mellem to vektorer og projektion af en vektor på en anden.'
    ],
    motivation: 'I computergrafik bruges skalarproduktet til at beregne, hvordan lys rammer en 3D-flade (shading), mens krydsproduktet bruges til at bestemme fladens retning (normalvektor). Det bruges også til at kode robotarmes bevægelser.'
  },

  // 10. Statistik og Sandsynlighed
  'statistik-og-sandsynlighed/grupperet-data': {
    overview: [
      'Opstilling af intervalhyppighed og intervalfrekvens ud fra grupperet observationer.',
      'Tegning og tolkning af sumkurver samt bestemmelse af kvartilsættet (25%, 50%, 75%).',
      'Forståelse af histogrammer og beregning af det estimerede gennemsnit.'
    ],
    motivation: 'Grupperet data bruges af tøjfirmaer til at inddele befolkningens kropsmål i standardstørrelser (S, M, L, XL), og af økonomer til at analysere indkomstfordelingen i et helt land (fx ved beregning af Gini-koefficienter).'
  },
  'statistik-og-sandsynlighed/kombinatorik': {
    overview: [
      'Anvendelse af multiplikationsprincippet og fakultetsbegrebet ($n!$).',
      'Beregning af antal permutationer (rækkefølgen er vigtig): $P(n,r)$.',
      'Beregning af antal kombinationer (rækkefølgen er ligegyldig): $K(n,r) = \\binom{n}{r}$.'
    ],
    motivation: 'Kombinatorik bruges af cybersikkerhedseksperter til at beregne, hvor svære adgangskoder er at hacke, af spilsites til at udregne pokerodds, samt i logistik til at finde det maksimale antal ruter for en levering.'
  },
  'statistik-og-sandsynlighed/sandsynlighedsfelter': {
    overview: [
      'Forståelse af udfaldsrummet $U$ og begrebet et sandsynlighedsfelt.',
      'Beregning af sandsynligheder i symmetriske sandsynlighedsfelter (antal gunstige / mulige).',
      'Anvendelse af komplementærhændelser og additions- og multiplikationsprincipperne.'
    ],
    motivation: 'Sandsynlighedsfelter bruges af spildesignere til at styre chancerne for sjældne fund ("loot drops") i rollespil, af forsikringsselskaber til at prissætte policer baseret på risiko, samt i meteorologi til vejrudsigter.'
  },
  'statistik-og-sandsynlighed/ugrupperet-data': {
    overview: [
      'Opstilling af hyppigheds- og frekvenstabeller for enkeltstående observationer.',
      'Beregning af statistiske deskriptorer som middelværdi (gennemsnit), median, typetal og spredning.',
      'Tegning og tolkning af boksplot til at visualisere dataspredning.'
    ],
    motivation: 'Ugrupperet data bruges i sportens verden til at sammenligne og analysere individuelle spilleres præstationer, af lærere til at analysere karakterfordelinger, og i hverdagen til at forstå dit personlige forbrugsmønster.'
  },

  // 11. Tal og Algebra
  'tal-og-algebra/broeker': {
    overview: [
      'Regneregler for at forlænge, forkorte og finde fællesnævner for brøker.',
      'Addition, subtraktion, multiplikation og division med brøker.',
      'Regneregler for at reducere komplekse brøker med ubekendte bogstaver (algebraiske brøker).'
    ],
    motivation: 'Brøker sikrer absolut matematisk præcision. De bruges i bageopskrifter til præcis skalering, i finansielle algoritmer for at undgå ødelæggende afrundingsfejl, og i landmåling under kortskalering.'
  },
  'tal-og-algebra/ligninger': {
    overview: [
      'De grundlæggende regler for at løse ligninger (gør det samme på begge sider af lighedstegnet).',
      'Metoder to at isolere en bestemt variabel i en formel.',
      'Løsning af to ligninger med to ubekendte ved hjælp af substitution eller lige store koefficienters metode.'
    ],
    motivation: 'Ligninger er det sprog, vi bruger til at løse gåder med ukendte værdier. Arkitekter bruger dem til at beregne bæreevner, kemikere til at afbalancere reaktioner, og finansanalytikere til at finde break-even punkter.'
  },
  'tal-og-algebra/potens-og-rod': {
    overview: [
      'Potensregnereglerne for multiplikation, division og potensering af potenser.',
      'Forståelse af negative potenser ($a^{-n} = \\frac{1}{a^n}$) og brøkpotenser.',
      'Sammenhængen mellem potenser og rødder (fx $\\sqrt[n]{x} = x^{1/n}$).'
    ],
    motivation: 'Potenser og rødder bruges til at beskrive naturfænomener i enorm eller mikroskopisk skala (fx nanoteknologi vs. lysår), til at måle jordskælv (Richterskalaen), samt i lydteknik til at måle decibel og akustisk intensitet.'
  },
  'tal-og-algebra/procent-og-rente': {
    overview: [
      'Beregning af procentvise stigninger, fald og absolutte forskelle.',
      'Anvendelse af fremskrivningsfaktoren $F = 1 + r$ til hurtig beregning.',
      'Anvendelse af renteformlen til kapitalfremskrivning (rentes rente).'
    ],
    motivation: 'Procent- og rentematematik er måske den vigtigste matematik i dit voksne liv. Den styrer alt omkring dine SU-lån, boliglån, pensionsopsparinger, inflation og prissætning af varer i butikkerne.'
  },
  'tal-og-algebra/regningsarter': {
    overview: [
      'Regnearternes hierarki: Parenteser $\\to$ Potenser/Rødder $\\to$ Gange/Dividere $\\to$ Plus/Minus.',
      'Regler for at hæve plusparenteser og minusparenteser korrekt.',
      'Regler for at gange en parentes med et tal eller en anden parentes.'
    ],
    motivation: 'Regnehierarkiet er selve fundamentet for al matematisk logik og computerkodning. Uden disse spilleregler ville computere og lommeregnere ikke kunne foretage en eneste entydig eller korrekt beregning.'
  }
};

// Traverse files recursively
function getMdxFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMdxFiles(filePath));
    } else if (file.endsWith('.mdx')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = getMdxFiles(docsDir);

console.log(`Found ${files.length} MDX files to process.`);

files.forEach(filePath => {
  const relPath = path.relative(docsDir, filePath).replace(/\\/g, '/').replace(/\.mdx$/, '');
  const data = mdxData[relPath];

  if (!data) {
    console.warn(`No mapping found for relative path: ${relPath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Check if box is already injected
  if (content.includes('bg-gradient-to-r from-purple-900/40 to-blue-900/40')) {
    console.log(`Skipping ${relPath} (already processed)`);
    return;
  }

  const boxHtml = `
<div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/30 rounded-xl p-5 my-6">
  <div className="font-bold text-purple-300 mb-2">⚡ Hurtigt Overblik</div>
  <ul className="list-disc pl-5 space-y-1 text-slate-350 text-sm mb-4">
    ${data.overview.map(item => `<li>${item}</li>`).join('\n    ')}
  </ul>
  <div className="font-bold text-blue-300 mb-1">🧠 Hvorfor lære det?</div>
  <p className="text-slate-300 text-sm leading-relaxed">
    ${data.motivation}
  </p>
</div>
`;

  // Find the first line starting with '# ' (the main title heading)
  const lines = content.split('\n');
  let headingIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('# ')) {
      headingIdx = i;
      break;
    }
  }

  if (headingIdx !== -1) {
    lines.splice(headingIdx + 1, 0, '', boxHtml.trim(), '');
    content = lines.join('\n');
    console.log(`Successfully injected box under heading in: ${relPath}`);
  } else {
    const parts = content.split('---');
    if (parts.length >= 3) {
      parts[2] = '\n' + boxHtml.trim() + '\n' + parts[2];
      content = parts.join('---');
      console.log(`Successfully injected box after frontmatter in: ${relPath}`);
    } else {
      console.error(`Could not find frontmatter or heading in: ${relPath}`);
      return;
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
});

console.log('Finished processing all files.');
