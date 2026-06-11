const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '..', 'src', 'content', 'docs');

const premiumQuestions = {
  // 1. Analytisk Plangeometri
  'analytisk-plangeometri/afstande': {
    question: 'Bestem afstanden mellem den rette linje $l: 3x - 4y + 5 = 0$ og cirklen med ligningen $(x-2)^2 + (y+1)^2 = 4$. Hvad er den korteste afstand fra linjen til cirkelperiferien?',
    options: ['1', '3', '2', '0.5'],
    correctIndex: 0,
    hint: 'Find først afstanden fra cirklens centrum til linjen ved hjælp af punkt-linje-afstandsformlen, og træk derefter cirklens radius fra.'
  },
  'analytisk-plangeometri/cirklens-ligning': {
    question: 'En cirkel har ligningen $x^2 - 6x + y^2 + 8y = 0$. Bestem ligningen for tangenten til cirklen i punktet $P(6,0)$ på cirkelperiferien.',
    options: ['$3x + 4y - 18 = 0$', '$3x - 4y - 18 = 0$', '$4x + 3y - 24 = 0$', '$3x + 4y - 24 = 0$'],
    correctIndex: 0,
    hint: 'Cirklens centrum er $(3,-4)$. Vektoren fra centrum til tangentpunktet $P(6,0)$ er normalvektor til tangenten.'
  },
  'analytisk-plangeometri/linjens-ligning': {
    question: 'To rette linjer har parameterfremstillingerne $l: (x,y) = (2,1) + t(2,-1)$ og $m: (x,y) = (1,4) + s(1,2)$. Bestem skæringspunktet mellem de to linjer.',
    options: ['$(0,2)$', '$(2,1)$', '$(4,0)$', '$(1,3)$'],
    correctIndex: 0,
    hint: 'Sæt koordinaterne lig hinanden for at få to ligninger med de to parametre $t$ og $s$, og løs dem.'
  },

  // 2. Avanceret Statistik
  'avanceret-statistik/binomialfordeling': {
    question: 'I et binomialt eksperiment med $n = 100$ og $p = 0.2$, hvad er sandsynligheden for at få præcis 20 succeser, afrundet til fire decimaler?',
    options: ['$0.0993$', '$0.2000$', '$0.0512$', '$0.1245$'],
    correctIndex: 0,
    hint: 'Brug formlen $P(X=20) = \\binom{100}{20} 0.2^{20} 0.8^{80}$.'
  },
  'avanceret-statistik/hypotesetest': {
    question: 'I en $\\chi^2$-uafhængighedstest med en kontingenstabel med 3 rækker og 4 kolonner, hvor mange frihedsgrader ($df$) skal anvendes til at bestemme den kritiske værdi?',
    options: ['$6$', '$12$', '$7$', '$5$'],
    correctIndex: 0,
    hint: 'Frihedsgrader beregnes som $df = (r-1) \\cdot (k-1)$, hvor $r$ er rækker og $k$ er kolonner.'
  },

  // 3. Funktioner
  'funktioner/andengradspolynomier': {
    question: 'Andengradspolynomiet $f(x) = ax^2 + bx + c$ går gennem punkterne $(0,2)$, $(1,3)$ og $(2,6)$. Bestem værdierne af $a$, $b$ og $c$.',
    options: ['$a=1, b=0, c=2$', '$a=1, b=1, c=2$', '$a=2, b=-1, c=2$', '$a=0.5, b=0.5, c=2$'],
    correctIndex: 0,
    hint: 'Punktet $(0,2)$ giver direkte $c = 2$. Opsæt derefter to ligninger med $a$ og $b$ ud fra de to andre punkter.'
  },
  'funktioner/eksponentiel-og-potens': {
    question: 'En eksponentiel udvikling $y = b \\cdot a^x$ fordobles hver gang $x$ vokser med $3$. Hvis begyndelsesværdien $b = 5$, hvad er funktionsværdien til $x = 9$?',
    options: ['$40$', '$15$', '$45$', '$35$'],
    correctIndex: 0,
    hint: 'Fordobling 3 gange svarer til at multiplicere med $2^3 = 8$.'
  },
  'funktioner/funktionsbegrebet': {
    question: 'Givet funktionen $f(x) = \\frac{\\sqrt{x-2}}{x-5}$. Hvad er funktionens definitionsmængde ($Dm(f)$)?',
    options: ['$[2; \\infty[ \\setminus \\{5\\}$', '$]2; \\infty[$', '$[2; 5[$', '$[2; \\infty[$'],
    correctIndex: 0,
    hint: 'Udtrykket under kvadratroden skal være $\\ge 0$, og nævneren må ikke være $0$.'
  },
  'funktioner/lineaere-funktioner': {
    question: 'En ret linje går gennem punkterne $A(-2, -5)$ og $B(4, 7)$. Bestem linjens skæring med y-aksen.',
    options: ['$-1$', '$1$', '$2$', '$0$'],
    correctIndex: 0,
    hint: 'Find først hældningskoefficienten $a$, og indsæt derefter et af punkterne i $y = ax + b$ for at finde $b$.'
  },
  'funktioner/regression': {
    question: 'I en lineær regression $y = ax + b$ er determinationskoefficienten $R^2 = 0.96$, og hældningen $a$ er negativ. Hvad er korrelationskoefficienten $r$?',
    options: ['$-0.98$', '$0.98$', '$-0.96$', '$0.96$'],
    correctIndex: 0,
    hint: 'Korrelationskoefficienten $r$ er kvadratroden af $R^2$, og dens fortegn er det samme som hældningen $a$.'
  },

  // 4. Geometri og Trigonometri
  'geometri-og-trigonometri/ensvinklede-trekanter': {
    question: 'To ensvinklede trekanter har sidelængderne $a, b, c$ og $a\', b\', c\'$. Hvis $a = 6$, $b = 8$ og arealet af den første trekant er $24$, hvad er arealet af den anden trekant, hvis skaleringsfaktoren $k = 1.5$?',
    options: ['$54$', '$36$', '$48$', '$24$'],
    correctIndex: 0,
    hint: 'Husk, at forholdet mellem arealer af ensvinklede figurer er lig med skaleringsfaktoren i anden potens ($k^2$).'
  },
  'geometri-og-trigonometri/pythagoras': {
    question: 'I en retvinklet trekant er hypotenusen $c = 13$, og differensen mellem de to kateter $a$ og $b$ er $7$ (dvs. $b - a = 7$). Bestem sidelængden af den korteste katete.',
    options: ['$5$', '$12$', '$8$', '$6$'],
    correctIndex: 0,
    hint: 'Opstil ligningen $a^2 + (a+7)^2 = 13^2$, og løs den som en andengradsligning.'
  },
  'geometri-og-trigonometri/sinus-cosinus-tan': {
    question: 'I en retvinklet trekant $ABC$ med $C = 90^\\circ$ gælder, at $\\sin(A) = 0.6$. Hvad er værdien af $\\tan(A)$?',
    options: ['$0.75$', '$1.33$', '$0.80$', '$0.60$'],
    correctIndex: 0,
    hint: 'Brug relationen $\\cos^2(A) + \\sin^2(A) = 1$ til at finde $\\cos(A)$, og beregn derefter $\\tan(A) = \\frac{\\sin(A)}{\\cos(A)}$.'
  },
  'geometri-og-trigonometri/trekantsberegninger': {
    question: 'I en trekant $ABC$ er $a = 5$, $b = 8$ og vinkel $C = 60^\\circ$. Bestem sidelængden $c$.',
    options: ['$7$', '$9$', '$6.5$', '$8.5$'],
    correctIndex: 0,
    hint: 'Brug cosinusrelationen: $c^2 = a^2 + b^2 - 2ab\\cos(C)$.'
  },

  // 5. Infinitesimalregning
  'infinitesimalregning/differentialkvotient': {
    question: 'Bestem den afledte funktion $f\'(x)$ for funktionen $f(x) = x^2 \\cdot e^x$.',
    options: ['$(x^2 + 2x)e^x$', '$2xe^x$', '$x^2e^x$', '$(2x + 2)e^x$'],
    correctIndex: 0,
    hint: 'Brug produktreglen: $(u \\cdot v)\' = u\'v + uv\'$ med $u = x^2$ og $v = e^x$.'
  },
  'infinitesimalregning/optimering-og-monotoni': {
    question: 'Vi ønsker at indhegne et rektangulært areal op mod en lige mur (så der kun skal hegn på 3 sider). Vi har 40 meter hegn til rådighed. Hvad er det maksimale areal, vi kan indhegne?',
    options: ['$200\\text{ m}^2$', '$100\\text{ m}^2$', '$400\\text{ m}^2$', '$150\\text{ m}^2$'],
    correctIndex: 0,
    hint: 'Udtryk arealet $A(x) = x \\cdot (40 - 2x)$ og find maksimum ved at differentiere og sætte lig $0$.'
  },
  'infinitesimalregning/tretrinsreglen': {
    question: 'Når man beviser, at differentialkvotienten af $f(x) = \\frac{1}{x}$ er $f\'(x) = -\\frac{1}{x^2}$ ved tretrinsreglen, hvad er differenskvotienten (sekantens hældning) efter trin 2?',
    options: ['$-\\frac{1}{x \\cdot (x + \\Delta x)}$', '$\\frac{1}{\\Delta x}$', '$-\\frac{1}{x^2}$', '$\\frac{\\Delta x}{x \\cdot (x + \\Delta x)}$'],
    correctIndex: 0,
    hint: 'Bring brøkerne på fællesnævner i trin 1, og divider derefter med $\\Delta x$ i trin 2.'
  },

  // 6. Matematik A - Avanceret Infinitesimalregning
  'matematik-a/avanceret-infinitesimalregning/graensevaerdier-og-kontinuitet': {
    question: 'Bestem grænseværdien: $\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3}$.',
    options: ['$6$', '$3$', '$0$', 'Eksisterer ikke'],
    correctIndex: 0,
    hint: 'Faktorer tælleren som $(x-3)(x+3)$ og forkort brøken før du tager grænseværdien.'
  },
  'matematik-a/avanceret-infinitesimalregning/integrationsregneregler': {
    question: 'Bestem den stamfunktion $F(x)$ til $f(x) = 3x^2 - 4x + 1$, som opfylder betingelsen $F(2) = 5$.',
    options: ['$x^3 - 2x^2 + x + 3$', '$x^3 - 2x^2 + x + 5$', '$x^3 - 2x^2 + x$', '$x^3 - 2x^2 + x + 1$'],
    correctIndex: 0,
    hint: 'Find det ubestemte integral $F(x) = x^3 - 2x^2 + x + C$ og løs for $C$ ved at indsætte $F(2) = 5$.'
  },
  'matematik-a/avanceret-infinitesimalregning/omdrejningslegemer': {
    question: 'En flade begrænses af funktionen $f(x) = \\sqrt{x}$ og x-aksen i intervallet $[0; 4]$. Bestem volumenet af det omdrejningslegeme, der fremkommer ved at rotere denne flade $360^\\circ$ om x-aksen.',
    options: ['$8\\pi$', '$16\\pi$', '$4\\pi$', '$12\\pi$'],
    correctIndex: 0,
    hint: 'Formlen er $V = \\pi \\int_{0}^{4} (f(x))^2 dx$. Indsæt $f(x) = \\sqrt{x}$ og integrer.'
  },
  'matematik-a/avanceret-infinitesimalregning/substitution': {
    question: 'Bestem det bestemte integral: $\\int_{0}^{1} x \\cdot e^{x^2} dx$.',
    options: ['$\\frac{e - 1}{2}$', '$e - 1$', '$\\frac{e}{2}$', '$2(e - 1)$'],
    correctIndex: 0,
    hint: 'Brug substitutionen $u = x^2$, hvilket medfører $du = 2x \\, dx$.'
  },

  // 7. Matematik A - Avanceret Statistik og Sandsynlighed
  'matematik-a/avanceret-statistik-og-sandsynlighed/intervalsandsynlighed': {
    question: 'Et 95% konfidensinterval for en population-andel $p$ er beregnet til $[0.42; 0.48]$. Hvad var stikprøveandelen $\\hat{p}$ og fejlmargenen (margin of error) for denne stikprøve?',
    options: ['$\\hat{p} = 0.45$, fejlmargen $= 0.03$', '$\\hat{p} = 0.45$, fejlmargen $= 0.06$', '$\\hat{p} = 0.46$, fejlmargen $= 0.02$', '$\\hat{p} = 0.44$, fejlmargen $= 0.04$'],
    correctIndex: 0,
    hint: 'Stikprøveandelen $\\hat{p}$ ligger præcis midt i konfidensintervallet, og fejlmargenen er afstanden fra midten til grænserne.'
  },
  'matematik-a/avanceret-statistik-og-sandsynlighed/normalfordeling-taethed': {
    question: 'En stokastisk variabel $X$ er normalfordelt med middelværdi $\\mu = 50$ og spredning $\\sigma = 10$. Hvad er sandsynligheden for at $X$ er større end $70$?',
    options: ['$2.5\\%$', '$5\\%$', '$16\\%$', '$0.15\\%$'],
    correctIndex: 0,
    hint: 'Værdien 70 ligger præcis 2 standardafvigelser over middelværdien. Brug symmetri og standardafvigelses-reglen.'
  },

  // 8. Matematik A - Differentialligninger
  'matematik-a/differentialligninger/eulers-metode': {
    question: 'Brug Eulers metode til at estimere $y(0.2)$ for differentialligningen $\\frac{dy}{dx} = x + y$ med begyndelsesbetingelsen $y(0) = 1$ og skridtlængde $h = 0.1$.',
    options: ['$1.21$', '$1.20$', '$1.10$', '$1.15$'],
    correctIndex: 0,
    hint: 'Beregn først $y(0.1)$ og derefter $y(0.2)$ ved at indsætte i formlen $y_{n+1} = y_n + h(x_n + y_n)$.'
  },
  'matematik-a/differentialligninger/logistisk-vaekst': {
    question: 'En logistisk differentialligning har formen $\\frac{dy}{dt} = 0.002y(500 - y)$. Hvad er den maksimale væksthastighed for denne population?',
    options: ['$125$', '$250$', '$500$', '$100$'],
    correctIndex: 0,
    hint: 'Maksimal væksthastighed opnås, når populationen $y$ er præcis halvdelen af bæreevnen $M = 500$.'
  },
  'matematik-a/differentialligninger/opstilling-af-modeller': {
    question: 'Væksthastigheden af en temperatur $T(t)$ er proportional med differensen mellem temperaturen og rumtemperaturen $T_R = 20^\\circ\\text{C}$ (Newtons afkølingslov). Hvis afkølingskonstanten er $k = 0.05$, hvilken differentialligning beskriver dette?',
    options: ['$\\frac{dT}{dt} = -0.05(T - 20)$', '$\\frac{dT}{dt} = 0.05T$', '$\\frac{dT}{dt} = -0.05T(T - 20)$', '$\\frac{dT}{dt} = -0.05(20 - T)$'],
    correctIndex: 0,
    hint: 'Da temperaturen falder mod rumtemperaturen, skal væksthastigheden være negativ proportional med $(T - T_R)$.'
  },
  'matematik-a/differentialligninger/separationsmetoden': {
    question: 'Find den fuldstændige løsning til differentialligningen $\\frac{dy}{dx} = \\frac{2x}{y}$ for $y > 0$.',
    options: ['$y = \\sqrt{2x^2 + C}$', '$y = x^2 + C$', '$y = \\sqrt{x^2 + C}$', '$y = 2x^2 + C$'],
    correctIndex: 0,
    hint: 'Separer de variable til $y \\, dy = 2x \\, dx$ og integrer derefter på begge sider.'
  },

  // 9. Matematik A - Vektorer og 3D Geometri
  'matematik-a/vektorer-og-analytisk-geometri/afstande': {
    question: 'Bestem den vinkelrette afstand fra punktet $P(1, 2, -1)$ til planen med ligningen $2x - y + 2z - 4 = 0$.',
    options: ['$2$', '$6$', '$3$', '$1$'],
    correctIndex: 0,
    hint: 'Brug afstandsformlen for punkt til plan i 3D: $d = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}$.'
  },
  'matematik-a/vektorer-og-analytisk-geometri/kuglens-ligning': {
    question: 'En kugle har ligningen $x^2 - 2x + y^2 + 4y + z^2 - 6z - 2 = 0$. Bestem kuglens radius.',
    options: ['$4$', '$16$', '$2$', '$5$'],
    correctIndex: 0,
    hint: 'Brug kvadratkomplettering for $x$, $y$ og $z$ og flyt de konstante tal over på højre side for at finde $r^2$.'
  },
  'matematik-a/vektorer-og-analytisk-geometri/parameterfremstilling-plan-og-rum': {
    question: 'En linje går gennem $A(1,0,2)$ med retningsvektor $\\vec{r} = (2, -1, 3)$, og en plan har ligningen $x + 2y - z + 4 = 0$. Hvad er skæringspunktet?',
    options: ['$(3, -1, 5)$', '$(1, 0, 2)$', '$(5, -2, 8)$', '$(0, 0, 4)$'],
    correctIndex: 0,
    hint: 'Indsæt linjens koordinatudtryk $x = 1+2t$, $y = -t$, og $z = 2+3t$ i planens ligning for at finde parameteren $t$.'
  },
  'matematik-a/vektorer-og-analytisk-geometri/skalar-og-krydsprodukt': {
    question: 'Givet to vektorer i rummet $\\vec{u} = (1, 2, 2)$ og $\\vec{v} = (2, -2, 1)$. Hvad er vinklen mellem de to vektorer afrundet til nærmeste grad?',
    options: ['$90^\\circ$', '$45^\\circ$', '$0^\\circ$', '$60^\\circ$'],
    correctIndex: 0,
    hint: 'Beregn skalarproduktet $\\vec{u} \\cdot \\vec{v}$. Hvis det giver $0$, er vektorerne ortogonale.'
  },

  // 10. Statistik og Sandsynlighed
  'statistik-og-sandsynlighed/grupperet-data': {
    question: 'Givet et datasæt, hvor 25%-kvartilen er $15$, medianen (50%-kvartilen) er $22$, og 75%-kvartilen er $30$. Hvilken af følgende påstande om kvartilbredden ($IQR$) og observationerne er sand?',
    options: ['$IQR = 15$, og $50\\%$ af observationerne ligger mellem $15$ og $30$', '$IQR = 7.5$, og medianen er præcis i midten', '$IQR = 15$, og $25\\%$ af observationerne er mindre end $15$', '$IQR = 22$, og $75\\%$ af observationerne er mindre end $30$'],
    correctIndex: 0,
    hint: 'Kvartilbredden $IQR$ er differensen $Q_3 - Q_1$, og der ligger altid $50\\%$ af observationerne i dette interval.'
  },
  'statistik-og-sandsynlighed/kombinatorik': {
    question: 'På hvor mange forskellige måder kan man vælge et udvalg på 4 personer ud af en gruppe på 10 personer?',
    options: ['$210$', '$5040$', '$120$', '$24$'],
    correctIndex: 0,
    hint: 'Brug kombinationsformlen $K(n,r) = \\binom{n}{r}$, da rækkefølgen af personer i et udvalg ikke er vigtig.'
  },
  'statistik-og-sandsynlighed/sandsynlighedsfelter': {
    question: 'Du kaster to almindelige 6-sidede terninger. Hvad er sandsynligheden for at summen af øjnene er præcis 10?',
    options: ['$\\frac{3}{36} = \\frac{1}{12}$', '$\\frac{4}{36} = \\frac{1}{9}$', '$\\frac{2}{36} = \\frac{1}{18}$', '$\\frac{1}{6}$'],
    correctIndex: 0,
    hint: 'Find alle kombinationer af øjne, der giver summen 10, og divider med det samlede antal mulige udfald (36).'
  },
  'statistik-og-sandsynlighed/ugrupperet-data': {
    question: 'Et ugrupperet datasæt består af tallene: $3, 5, 5, 6, 8, 9, 20$. Bestem medianen.',
    options: ['$6$', '$8$', '$5$', '$9$'],
    correctIndex: 0,
    hint: 'Sortér først observationerne (hvilket de allerede er) og find den midterste værdi.'
  },

  // 11. Tal og Algebra
  'tal-og-algebra/broeker': {
    question: 'Løs og reducer følgende brøkbetingede udtryk med variable: $\\frac{x}{2} - \\frac{x-3}{3}$.',
    options: ['$\\frac{x + 6}{6}$', '$\\frac{x - 6}{6}$', '$\\frac{x + 3}{6}$', '$\\frac{x - 3}{6}$'],
    correctIndex: 0,
    hint: 'Find en fællesnævner (hvilket er 6) og husk at minus parentesen ændrer fortegn på $-3$.'
  },
  'tal-og-algebra/ligninger': {
    question: 'Løs ligningssystemet med to ubekendte: $2x + y = 7$ og $x - 3y = 7$. Hvad er værdien af $x$?',
    options: ['$4$', '$-1$', '$3$', '$2$'],
    correctIndex: 0,
    hint: 'Isoler $x$ i den anden ligning og indsæt i den første ligning.'
  },
  'tal-og-algebra/potens-og-rod': {
    question: 'Reducer udtrykket: $\\frac{(a^2 \\cdot b)^3}{a^4 \\cdot b^{-1}}$.',
    options: ['$a^2 \\cdot b^4$', '$a^2 \\cdot b^2$', '$a \\cdot b^4$', '$a^2 \\cdot b^3$'],
    correctIndex: 0,
    hint: 'Gange potensen ind i parentesen $(a^2 \\cdot b)^3 = a^6 \\cdot b^3$ og brug derefter divisionsreglerne.'
  },
  'tal-og-algebra/procent-og-rente': {
    question: 'En opsparing på $10.000$ kr. indsættes på en konto med en årlig rente på $3\\%$. Hvad er opsparingens værdi efter $5$ år, afrundet til hele kr.?',
    options: ['$11.593\\text{ kr.}$', '$11.500\\text{ kr.}$', '$12.155\\text{ kr.}$', '$10.850\\text{ kr.}$'],
    correctIndex: 0,
    hint: 'Brug kapitalfremskrivningsformlen: $K_5 = K_0 \\cdot (1 + r)^5$.'
  },
  'tal-og-algebra/regningsarter': {
    question: 'Hvad er resultatet af parentesudtrykket: $-(2a - 3b) - 3(a - b)$ ganget ud og reduceret?',
    options: ['$-5a + 6b$', '$-5a$', '$-5a + 3b$', '$-a + 6b$'],
    correctIndex: 0,
    hint: 'En minusparentes ændrer alle fortegn indeni, og tallet 3 skal ganges ind på begge led i den anden parentes.'
  }
};

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
  const data = premiumQuestions[relPath];

  if (!data) {
    console.warn(`No premium question defined for path: ${relPath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Skip if already contains a premium quiz block
  if (content.includes('isPremium: true') || content.includes('-quiz-premium')) {
    console.log(`Skipping ${relPath} (already has premium question)`);
    return;
  }

  // Create the premium question object to inject
  const keySafe = relPath.replace(/\//g, '-');
  const premiumObj = `,\n      {\n        quizId: "${keySafe}-quiz-premium",\n        question: \`${data.question}\`,\n        options: ${JSON.stringify(data.options, null, 10).replace(/\n/g, '\n        ')},\n        correctIndex: ${data.correctIndex},\n        hint: \`${data.hint}\`,\n        isPremium: true\n      }`;

  // Find ending pattern \s* ]} \s* />
  // We use (\s*\]\}\s*(\/\s*)?>) to support closing tag flexibility
  const endPatternRegex = /(\s*\]\}\s*(\/\s*)?>)/s;
  if (endPatternRegex.test(content)) {
    content = content.replace(endPatternRegex, () => `${premiumObj}\n  ]} \n/>`);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Injected premium question into: ${relPath}`);
  } else {
    console.error(`Could not locate end of ExerciseHub array in: ${relPath}`);
  }
});

console.log('Premium questions injection complete.');
