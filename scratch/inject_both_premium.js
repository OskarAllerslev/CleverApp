import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database 1 (from inject_premium_questions.cjs)
const db1 = {
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
  'matematik-a/differentialligninger/eulers-metode': {
    question: 'Brug Eulers metode til at estimere $y(0.2)$ for differentialligningen $\\frac{dy}{dx} = x + y$ med begyndelsesbetingelsen $y(0) = 1$ og skridtlængde $h = 0.1$.',
    options: ['$1.21$', '$1.20$', '$1.10$', '$1.15$'],
    correctIndex: 0,
    hint: 'Beregn først $y(0.1)$ og derefter $y(0.2)$ ved at indsætte i formlen $y_{n+1} = y_n + h(x_n + y_n).'
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
  'matematik-a/vektorer-og-analytisk-geometri/afstande': {
    question: 'Bestem den vinkelrette afstand fra punktet $P(1, 2, -1)$ til planen med ligningen $2x - y + 2z - 4 = 0$.',
    options: ['$2$', '$6$', '$3$', '$1$'],
    correctIndex: 0,
    hint: 'Brug afstandsformlen for punkt til plan i 3D: $d = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}.$'
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

// Database 2 (from add_premium_questions.js)
const db2 = {
  'tal-og-algebra/regningsarter': {
    quizId: 'tal-og-algebra-regningsarter-quiz-premium-2',
    question: 'Reducer udtrykket $4(2x - y) - 3(x + 2y) - (5x - 8y)$ mest muligt.',
    options: ['$-2y$', '$0$', '$-2x$', '$8x - 12y$'],
    correctIndex: 0,
    hint: 'Gang ind i alle parenteser og vær opmærksom på fortegnene, især den sidste minusparentes.'
  },
  'tal-og-algebra/broeker': {
    quizId: 'tal-og-algebra-broeker-quiz-premium-2',
    question: 'Hvad er resultatet af divisionen: $\\frac{2a}{3b} : \\frac{4a^2}{9b^2}$ forkortet mest muligt?',
    options: ['$\\frac{3b}{2a}$', '$\\frac{8a^3}{27b^3}$', '$\\frac{3b^2}{2a}$', '$\\frac{3}{2}$'],
    correctIndex: 0,
    hint: 'At dividere med en brøk er det samme som at gange med den omvendte. Forkort derefter fælles faktorer i tæller og nævner.'
  },
  'tal-og-algebra/ligninger': {
    quizId: 'tal-og-algebra-ligninger-quiz-premium-2',
    question: 'Løs ligningen for $x$: $\\frac{3x - 2}{4} - \\frac{x + 1}{3} = 1$.',
    options: ['$x = \\frac{22}{5}$', '$x = \\frac{10}{5}$', '$x = 3$', '$x = 2$'],
    correctIndex: 0,
    hint: 'Find en fællesnævner (12) og gang alle led på begge sider med denne for at fjerne brøkerne.'
  },
  'tal-og-algebra/potens-og-rod': {
    quizId: 'tal-og-algebra-potens-og-rod-quiz-premium-2',
    question: 'Forenkl udtrykket $\\frac{(2^3 \\cdot 2^{-1})^2}{\\sqrt{16} \\cdot 2^2}$ mest muligt.',
    options: ['$1$', '$2$', '$2^2$', '$2^{-2}$'],
    correctIndex: 0,
    hint: 'Brug potensregnereglerne $a^n \\cdot a^m = a^{n+m}$ og $(a^n)^m = a^{n \\cdot m}$. Husk også, at $\\sqrt{16} = 4 = 2^2$.'
  },
  'tal-og-algebra/procent-og-rente': {
    quizId: 'tal-og-algebra-procent-og-rente-quiz-premium-2',
    question: 'En kapital vokser med $3\\%$ pr. år. Hvor mange år tager det før kapitalen er fordoblet?',
    options: ['Ca. $23,4$ år', 'Præcis $20$ år', 'Ca. $33,3$ år', 'Ca. $15,2$ år'],
    correctIndex: 0,
    hint: 'Opstil ligningen $(1+r)^n = 2$, hvor $r = 0,03$. Løs ligningen ved hjælp af logaritmer.'
  },
  'geometri-og-trigonometri/ensvinklede-trekanter': {
    quizId: 'geometri-og-trigonometri-ensvinklede-trekanter-quiz-premium-2',
    question: 'To ensvinklede trekanter $T_1$ og $T_2$ har arealerne $A_1 = 12$ og $A_2 = 48$. Hvis en side i $T_1$ er $5$, hvad er den tilsvarende side i $T_2$?',
    options: ['$10$', '$20$', '$15$', '$2.5$'],
    correctIndex: 0,
    hint: 'For ensvinklede figurer gælder det, at arealforholdet er lig med kvadratet på skalaforholdet ($k^2$).'
  },
  'geometri-og-trigonometri/pythagoras': {
    quizId: 'geometri-og-trigonometri-pythagoras-quiz-premium-2',
    question: 'I en retvinklet trekant er den ene katete dobbelt så lang som den anden. Hvis hypotenusen er $\\sqrt{20}$, hvor lange er kateterne?',
    options: ['$2$ og $4$', '$1$ og $2$', '$3$ og $6$', '$2$ og $8$'],
    correctIndex: 0,
    hint: 'Sæt den korte katete til $x$ og den lange til $2x$, og brug relationen $a^2 + b^2 = c^2$.'
  },
  'geometri-og-trigonometri/sinus-cosinus-tan': {
    quizId: 'geometri-og-trigonometri-sinus-cosinus-tan-quiz-premium-2',
    question: 'I en retvinklet trekant er en vinkel $A = 30^\\circ$ og den modstående katete $a = 6$. Hvor lang er hypotenusen $c$?',
    options: ['$12$', '$6\\sqrt{3}$', '$3$', '$8$'],
    correctIndex: 0,
    hint: 'Brug formlen $\\sin(A) = \\frac{\\text{modstående}}{\\text{hypotenuse}}$ og isoler $c$.'
  },
  'geometri-og-trigonometri/trekantsberegninger': {
    quizId: 'geometri-og-trigonometri-trekantsberegninger-quiz-premium-2',
    question: 'I en trekant ABC er $a = 5$, $b = 8$ og $C = 60^\\circ$. Beregn sidelængden $c$.',
    options: ['$7$', '$\\sqrt{39}$', '$9$', '$\\sqrt{89}$'],
    correctIndex: 0,
    hint: 'Brug cosinusrelationen: $c^2 = a^2 + b^2 - 2ab\\cos(C)$.'
  },
  'funktioner/funktionsbegrebet': {
    quizId: 'funktioner-funktionsbegrebet-quiz-premium-2',
    question: 'Hvad er den definitionsmængde $\\text{Dm}(f)$ for funktionen $f(x) = \\frac{1}{\\sqrt{x^2 - 9}}$?',
    options: ['$x < -3$ eller $x > 3$', '$x > 3$', '$x \\neq \\pm 3$', '$\\mathbb{R}$'],
    correctIndex: 0,
    hint: 'Nævneren må ikke være nul, og udtrykket under kvadratroden skal være strengt positivt.'
  },
  'funktioner/lineaere-funktioner': {
    quizId: 'funktioner-lineaere-funktioner-quiz-premium-2',
    question: 'En ret linje går gennem punkterne $(2, 7)$ og $(5, 16)$. Hvad er linjens ligning?',
    options: ['$y = 3x + 1$', '$y = 3x - 1$', '$y = 2x + 3$', '$y = 4x - 1$'],
    correctIndex: 0,
    hint: 'Bestem først hældningen $a$ med topunktsformlen, og find derefter skæringen med y-aksen $b$.'
  },
  'funktioner/andengradspolynomier': {
    quizId: 'funktioner-andengradspolynomier-quiz-premium-2',
    question: 'Find toppunktet for andengradspolynomiet $f(x) = -2x^2 + 8x - 5$.',
    options: ['$(2, 3)$', '$(2, -5)$', '$(-2, -29)$', '$(4, -5)$'],
    correctIndex: 0,
    hint: 'Formlen for toppunktet er $T = \\left(\\frac{-b}{2a}, \\frac{-d}{4a}\\right)$.'
  },
  'funktioner/eksponentiel-og-potens': {
    quizId: 'funktioner-eksponentiel-og-potens-quiz-premium-2',
    question: 'En potensfunktion $f(x) = b \\cdot x^a$ går gennem punkterne $(1, 3)$ og $(2, 24)$. Bestem forskriften.',
    options: ['$f(x) = 3 \\cdot x^3$', '$f(x) = 3 \\cdot x^2$', '$f(x) = 2 \\cdot x^3$', '$f(x) = 3 \\cdot 2^x$'],
    correctIndex: 0,
    hint: 'Brug punktet $(1,3)$ til nemt at bestemme $b$, da $1^a = 1$. Indsæt derefter $b$ og det andet punkt for at finde $a$.'
  },
  'funktioner/regression': {
    quizId: 'funktioner-regression-quiz-premium-2',
    question: 'Hvis forklaringsgraden $R^2$ for en lineær regression er $0,98$, hvad kan vi konkludere?',
    options: ['$98\\%$ af variationen i y-værdierne forklares af den lineære model', 'Modellen har en fejl på $2\\%$ i alle forudsigelser', 'Hældningen på linjen er positiv', 'Modellen er $100\\%$ sand for alle data'],
    correctIndex: 0,
    hint: '$R^2$-værdien (definitionskoefficienten) måler styrken af den lineære sammenhæng.'
  },
  'statistik-og-sandsynlighed/ugrupperet-data': {
    quizId: 'statistik-og-sandsynlighed-ugrupperet-data-quiz-premium-2',
    question: 'Hvad er medianen for følgende datasæt: $12, 5, 22, 17, 9, 14, 11$?',
    options: ['$12$', '$11$', '$13$', '$14$'],
    correctIndex: 0,
    hint: 'Sorter først datasættet i stigende rækkefølge. Medianen er den midterste værdi.'
  },
  'statistik-og-sandsynlighed/grupperet-data': {
    quizId: 'statistik-og-sandsynlighed-grupperet-data-quiz-premium-2',
    question: 'Hvad kaldes den x-værdi på sumkurven, hvor den kumulerede frekvens rammer $75\\%$?',
    options: ['Øvre kvartil ($Q_3$)', 'Medianen ($Q_2$)', 'Nedre kvartil ($Q_1$)', 'Typetallet'],
    correctIndex: 0,
    hint: 'Kvartilsættet aflæses på sumkurven ved y-værdierne $25\\%$, $50\\%$ og $75\\%$.'
  },
  'statistik-og-sandsynlighed/sandsynlighedsfelter': {
    quizId: 'statistik-og-sandsynlighed-sandsynlighedsfelter-quiz-premium-2',
    question: 'Du trækker to kort fra et almindeligt spil kort (52 kort) uden tilbagelægning. Hvad er sandsynligheden for, at begge er esser?',
    options: ['$\\frac{1}{221}$', '$\\frac{1}{169}$', '$\\frac{1}{26}$', '$\\frac{3}{676}$'],
    correctIndex: 0,
    hint: 'Brug multiplikationsprincippet for betinget sandsynlighed: $P(A \\cap B) = P(A) \\cdot P(B|A)$.'
  },
  'statistik-og-sandsynlighed/kombinatorik': {
    quizId: 'statistik-og-sandsynlighed-kombinatorik-quiz-premium-2',
    question: 'På hvor mange måder kan man vælge et udvalg på 3 personer ud af en gruppe på 10 personer?',
    options: ['$120$', '$720$', '$30$', '$240$'],
    correctIndex: 0,
    hint: 'Da rækkefølgen af personerne i udvalget ikke har betydning, skal du bruge formlen for kombinationer $K(n, r) = \\binom{n}{r}$.'
  },
  'analytisk-plangeometri/linjens-ligning': {
    quizId: 'analytisk-plangeometri-linjens-ligning-quiz-premium-2',
    question: 'En ligning har normalvektoren $\\vec{n} = \\binom{3}{-4}$ og går gennem punktet $P(2, 5)$. Hvad er linjens ligning på standardform?',
    options: ['$3x - 4y + 14 = 0$', '$3x - 4y - 14 = 0$', '$3x + 4y - 26 = 0$', '$-4x + 3y - 7 = 0$'],
    correctIndex: 0,
    hint: 'Brug standardformlen for linjens ligning: $a(x - x_0) + b(y - y_0) = 0$, hvor $\\vec{n} = \\binom{a}{b}$.'
  },
  'analytisk-plangeometri/cirklens-ligning': {
    quizId: 'analytisk-plangeometri-cirklens-ligning-quiz-premium-2',
    question: 'Hvad er centrum og radius for cirklen med ligningen $x^2 + y^2 - 6x + 8y = 0$?',
    options: ['$C(3, -4)$ og $r = 5$', '$C(-3, 4)$ og $r = 5$', '$C(3, -4)$ og $r = 25$', '$C(6, -8)$ og $r = 10$'],
    correctIndex: 0,
    hint: 'Omskriv ligningen ved at lave kvadratkomplettering for $x$-leddene og $y$-leddene hver for sig.'
  },
  'analytisk-plangeometri/afstande': {
    quizId: 'analytisk-plangeometri-afstande-quiz-premium-2',
    question: 'Bestem afstanden mellem de to parallelle linjer $L_1: 3x - 4y + 5 = 0$ og $L_2: 3x - 4y - 10 = 0$.',
    options: ['$3$', '$15$', '$5$', '$2.5$'],
    correctIndex: 0,
    hint: 'Find et tilfældigt punkt på den ene linje, og brug derefter punkt-linje afstandsformlen til at finde afstanden til den anden linje.'
  },
  'infinitesimalregning/differentialkvotient': {
    quizId: 'infinitesimalregning-differentialkvotient-quiz-premium-2',
    question: 'Bestem differentialkvotienten $f\'(x)$ for funktionen $f(x) = x^2 \\cdot \\ln(x)$ ved brug af produktreglen.',
    options: ['$2x \\cdot \\ln(x) + x$', '$2x \\cdot \\ln(x) + 1$', '$2x + \\frac{1}{x}$', '$x(2\\ln(x) - 1)$'],
    correctIndex: 0,
    hint: 'Brug produktreglen for differentiation: $(u \\cdot v)\' = u\' \\cdot v + u \\cdot v\'$.'
  },
  'infinitesimalregning/tretrinsreglen': {
    quizId: 'infinitesimalregning-tretrinsreglen-quiz-premium-2',
    question: 'Hvilket af følgende udtryk definerer grænseværdien for sekantens hældning, når vi lader sekanten nærme sig tangenten?',
    options: ['$\\lim_{\\Delta x \\to 0} \\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}$', '$\\lim_{x \\to x_0} \\frac{f(x) + f(x_0)}{x - x_0}$', '$\\lim_{\\Delta x \\to \\infty} \\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}$', '$\\frac{f(x_0 + \\Delta x) - f(x_0)}{\\Delta x}$'],
    correctIndex: 0,
    hint: 'Tretrinsreglen finder grænseværdien for differenskvotienten, når tilvæksten i x ($\\Delta x$) går mod nul.'
  },
  'infinitesimalregning/optimering-og-monotoni': {
    quizId: 'infinitesimalregning-optimering-og-monotoni-quiz-premium-2',
    question: 'Find de lokale ekstremumssteder for funktionen $f(x) = \\frac{1}{3}x^3 - 4x$.',
    options: ['$x = 2$ og $x = -2$', '$x = 4$ og $x = -4$', '$x = 0$', '$x = 2$ (kun)'],
    correctIndex: 0,
    hint: 'Differentier funktionen og løs ligningen $f\'(x) = 0$ for at finde de kritiske punkter.'
  },
  'avanceret-statistik/binomialfordeling': {
    quizId: 'avanceret-statistik-binomialfordeling-quiz-premium-2',
    question: 'En stokastisk variabel $X$ er binomialfordelt med $n = 5$ og $p = 0.2$. Hvad er middelværdien $\\mu$ og variansen $\\sigma^2$?',
    options: ['$\\mu = 1$ og $\\sigma^2 = 0.8$', '$\\mu = 1$ og $\\sigma^2 = 0.2$', '$\\mu = 2$ og $\\sigma^2 = 1.6$', '$\\mu = 1$ og $\\sigma^2 = 1$'],
    correctIndex: 0,
    hint: 'Brug formlerne for middelværdi $\\mu = n \\cdot p$ og varians $\\sigma^2 = n \\cdot p \\cdot (1 - p)$ for en binomialfordeling.'
  },
  'avanceret-statistik/hypotesetest': {
    quizId: 'avanceret-statistik-hypotesetest-quiz-premium-2',
    question: 'Hvis p-værdien i en hypotesetest beregnes til $0,034$, og signifikansniveauet er sat til $\\alpha = 0,05$, hvad er konklusionen?',
    options: ['Nulhypotesen forkastes', 'Nulhypotesen accepteres', 'Testen er ugyldig', 'Det kritiske område skal udvides'],
    correctIndex: 0,
    hint: 'Vi forkaster nulhypotesen ($H_0$), hvis den beregnede p-værdi er mindre end signifikansniveauet $\\alpha$.'
  },
  'matematik-a/vektorer-og-analytisk-geometri/parameterfremstilling-plan-og-rum': {
    quizId: 'matematik-a-vektorer-og-analytisk-geometri-parameterfremstilling-plan-og-rum-quiz-premium-2',
    question: 'En linje i rummet går gennem $P(1, 2, 3)$ med retningsvektor $\\vec{r} = \\begin{pmatrix} 2 \\\\ -1 \\\\ 4 \\end{pmatrix}$. Hvilket af følgende punkter ligger på linjen?',
    options: ['$(3, 1, 7)$', '$(2, 1, 7)$', '$(1, 0, 3)$', '$(5, 0, 11)$'],
    correctIndex: 0,
    hint: 'Indsæt koordinaterne i parameterfremstillingen og se, om der findes en fælles værdi af parameteren $t$ for alle tre koordinater.'
  },
  'matematik-a/vektorer-og-analytisk-geometri/skalar-og-krydsprodukt': {
    quizId: 'matematik-a-vektorer-og-analytisk-geometri-skalar-og-krydsprodukt-quiz-premium-2',
    question: 'Bestem krydsproduktet $\\vec{a} \\times \\vec{b}$ af vektorerne $\\vec{a} = \\begin{pmatrix} 1 \\\\ 2 \\\\ 0 \\end{pmatrix}$ og $\\vec{b} = \\begin{pmatrix} 0 \\\\ 1 \\\\ 3 \\end{pmatrix}$.',
    options: ['$\\begin{pmatrix} 6 \\\\ -3 \\\\ 1 \\end{pmatrix}$', '$\\begin{pmatrix} 6 \\\\ 3 \\\\ 1 \\end{pmatrix}$', '$\\begin{pmatrix} 2 \\\\ 3 \\\\ 1 \\end{pmatrix}$', '$\\begin{pmatrix} 6 \\\\ -3 \\\\ -1 \\end{pmatrix}$'],
    correctIndex: 0,
    hint: 'Brug determinantmetoden til at beregne krydsproduktet: $\\vec{a} \\times \\vec{b} = \\begin{pmatrix} a_2b_3 - a_3b_2 \\\\ a_3b_1 - a_1b_3 \\\\ a_1b_2 - a_2b_1 \\end{pmatrix}$.'
  },
  'matematik-a/vektorer-og-analytisk-geometri/kuglens-ligning': {
    quizId: 'matematik-a-vektorer-og-analytisk-geometri-kuglens-ligning-quiz-premium-2',
    question: 'En kugle har ligningen $x^2 + y^2 + z^2 - 2x + 4y - 6z - 2 = 0$. Hvad er kuglens centrum og radius?',
    options: ['$C(1, -2, 3)$ og $r = 4$', '$C(-1, 2, -3)$ og $r = 4$', '$C(1, -2, 3)$ og $r = \\sqrt{16}$', '$C(1, -2, 3)$ og $r = 2$'],
    correctIndex: 0,
    hint: 'Kvadratkompletter for alle tre variable ($x$, $y$ og $z$) for at bringe ligningen på standardformen $(x-a)^2 + (y-b)^2 + (z-c)^2 = r^2$.'
  },
  'matematik-a/vektorer-og-analytisk-geometri/afstande': {
    quizId: 'matematik-a-vektorer-og-analytisk-geometri-afstande-quiz-premium-2',
    question: 'Bestem afstanden fra punktet $P(1, 2, 4)$ til planen $\\alpha: 2x - y + 2z + 3 = 0$.',
    options: ['$\\frac{11}{3}$', '$3$', '$4$', '$\\frac{11}{9}$'],
    correctIndex: 0,
    hint: 'Brug afstandsformlen fra punkt to plan in 3D: $d(P, \\alpha) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}.$'
  },
  'matematik-a/avanceret-infinitesimalregning/graensevaerdier-og-kontinuitet': {
    quizId: 'matematik-a-avanceret-infinitesimalregning-graensevaerdier-og-kontinuitet-quiz-premium-2',
    question: 'Bestem grænseværdien $\\lim_{x \\to 0} \\frac{\\sin(3x)}{x}$ ved brug af L\'Hôpitals regel.',
    options: ['$3$', '$1$', '$0$', 'Grænseværdien eksisterer ikke'],
    correctIndex: 0,
    hint: 'Da grænseværdien er af typen $\\frac{0}{0}$, kan du differentiere tæller og nævner hver for sig og derefter tage grænseværdien.'
  },
  'matematik-a/avanceret-infinitesimalregning/integrationsregneregler': {
    quizId: 'matematik-a-avanceret-infinitesimalregning-integrationsregneregler-quiz-premium-2',
    question: 'Beregn det bestemte integral $\\int_{1}^{3} (3x^2 - 2x) \\, dx$.',
    options: ['$18$', '$20$', '$16$', '$26$'],
    correctIndex: 0,
    hint: 'Find stamfunktionen $F(x) = x^3 - x^2$, og beregn derefter værdien $F(3) - F(1)$.'
  },
  'matematik-a/avanceret-infinitesimalregning/substitution': {
    quizId: 'matematik-a-avanceret-infinitesimalregning-substitution-quiz-premium-2',
    question: 'Find det ubestemte integral $\\int 2x \\cdot e^{x^2} \\, dx$ ved substitution.',
    options: ['$e^{x^2} + C$', '$2e^{x^2} + C$', '$x^2 \\cdot e^{x^2} + C$', '$\\frac{1}{2}e^{x^2} + C$'],
    correctIndex: 0,
    hint: 'Sæt den indre funktion $t = x^2$, så differentialet bliver $dt = 2x \\, dx$. Dette lader dig erstatte hele udtrykket.'
  },
  'matematik-a/avanceret-infinitesimalregning/omdrejningslegemer': {
    quizId: 'matematik-a-avanceret-infinitesimalregning-omdrejningslegemer-quiz-premium-2',
    question: 'Funktionen $f(x) = \\sqrt{x}$ drejes $360^\\circ$ om x-aksen i intervallet $[0, 4]$. Beregn volumenet $V$ af omdrejningslegemet.',
    options: ['$8\\pi$', '$16\\pi$', '$4\\pi$', '$12\\pi$'],
    correctIndex: 0,
    hint: 'Formlen for volumen av omdrejningslegeme om x-aksen er $V = \\pi \\int_{a}^{b} (f(x))^2 \\, dx$.'
  },
  'matematik-a/differentialligninger/opstilling-af-modeller': {
    quizId: 'matematik-a-differentialligninger-opstilling-af-modeller-quiz-premium-2',
    question: 'En population vokser med en hastighed, der er proportional med kvadratroden af populationens størrelse $y$. Opstil differentialligningen.',
    options: ['$\\frac{dy}{dt} = k \\cdot \\sqrt{y}$', '$\\frac{dy}{dt} = k \\cdot y^2$', '$\\frac{dy}{dt} = \\frac{k}{\\sqrt{y}}$', '$y(t) = k \\cdot \\sqrt{t}$'],
    correctIndex: 0,
    hint: 'Proportionalitet betyder, at væksthastigheden $\\frac{dy}{dt}$ er lig med en konstant $k$ ganget med udtrykket $\\sqrt{y}$.'
  },
  'matematik-a/differentialligninger/separationsmetoden': {
    quizId: 'matematik-a-differentialligninger-separationsmetoden-quiz-premium-2',
    question: 'Løs differentialligningen $\\frac{dy}{dx} = 3x^2 \\cdot y$, hvor $y > 0$.',
    options: ['$y = C \\cdot e^{x^3}$', '$y = e^{x^3} + C$', '$y = C \\cdot e^{3x^2}$', '$y = x^3 \\cdot y + C$'],
    correctIndex: 0,
    hint: 'Separer de variable til $\\frac{1}{y} \\, dy = 3x^2 \\, dx$, og integrer på begge sider.'
  },
  'matematik-a/differentialligninger/logistisk-vaekst': {
    quizId: 'matematik-a-differentialligninger-logistisk-vaekst-quiz-premium-2',
    question: 'En logistisk differentialligning har formen $\\frac{dy}{dt} = 0,002 \\cdot y \\cdot (500 - y)$. Hvad er populationens bæreevne $M$?',
    options: ['$500$', '$0.002$', '$1000$', '$250$'],
    correctIndex: 0,
    hint: 'Sammenlign med den standardiserede logistiske vækstformel $\\frac{dy}{dt} = a \\cdot y(M - y)$, hvor $M$ er den maksimale bæreevne.'
  },
  'matematik-a/differentialligninger/eulers-metode': {
    quizId: 'matematik-a-differentialligninger-eulers-metode-quiz-premium-2',
    question: 'Vi bruger Eulers metode til at løse $\\frac{dy}{dx} = x + y$ med startpunkt $(0, 1)$ og skridtlængde $h = 0.1$. Hvad er den tilnærmede værdi af $y(0.1)$?',
    options: ['$1.1$', '$1.0$', '$1.2$', '$1.15$'],
    correctIndex: 0,
    hint: 'Formlen for Eulers metode er $y_{n+1} = y_n + h \\cdot f(x_n, y_n)$. Beregn hældningen i startpunktet og tag et skridt af længde $h$.'
  },
  'matematik-a/avanceret-statistik-og-sandsynlighed/normalfordeling-taethed': {
    quizId: 'matematik-a-avanceret-statistik-og-sandsynlighed-normalfordeling-taethed-quiz-premium-2',
    question: 'En normalfordeling har middelværdien $\\mu = 100$ og spredningen $\\sigma = 15$. Hvad er sandsynligheden for at en observation ligger i intervallet $[70, 130]$?',
    options: ['Ca. $95.4\\%$', 'Ca. $68.2\\%$', 'Ca. $99.7\\%$', 'Ca. $50.0\\%$'],
    correctIndex: 0,
    hint: 'Intervallet $[70, 130]$ svarer præcis til $\\mu - 2\\sigma$ og $\\mu + 2\\sigma$. Husk $68-95-99.7$-reglen.'
  },
  'matematik-a/avanceret-statistik-og-sandsynlighed/intervalsandsynlighed': {
    quizId: 'matematik-a-avanceret-statistik-og-sandsynlighed-intervalsandsynlighed-quiz-premium-2',
    question: 'Hvilket af følgende integraler udtrykker intervalsandsynligheden $P(a \\le X \\le b)$ for en stokastisk variabel med tæthedsfunktion $f(x)$?',
    options: ['$\\int_{a}^{b} f(x) \\, dx$', '$f(b) - f(a)$', '$\\int_{-\\infty}^{\\infty} f(x) \\, dx$', '$P(X \\le b) + P(X \\ge a)$'],
    correctIndex: 0,
    hint: 'Sandsynligheden for, at en kontinuert stokastisk variabel ligger i et interval, er lig med arealet under tæthedsfunktionen i det pågældende interval.'
  }
};

const docsDir = path.join(__dirname, '..', 'src', 'content', 'docs');

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

let successCount = 0;

files.forEach(filePath => {
  const relPath = path.relative(docsDir, filePath).replace(/\\/g, '/').replace(/\.mdx$/, '');
  const q1 = db1[relPath];
  const q2 = db2[relPath];

  if (!q1 || !q2) {
    console.warn(`Missing questions for slug: ${relPath} (q1: ${!!q1}, q2: ${!!q2})`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Let's locate the last ']}' in the file, which ends the questions array of ExerciseHub
  const lastBracketIndex = content.lastIndexOf(']}');
  if (lastBracketIndex === -1) {
    console.error(`Could not find ']' in ${relPath}`);
    return;
  }
  
  // Find the closing brace '}' of the last question before the array end
  const lastBraceIndex = content.lastIndexOf('}', lastBracketIndex - 1);
  if (lastBraceIndex === -1) {
    console.error(`Could not find closing brace '}' before ']' in ${relPath}`);
    return;
  }

  // Verify there is only whitespace/newlines between that '}' and the array end ']}'
  const between = content.substring(lastBraceIndex + 1, lastBracketIndex);
  if (between.trim() !== '') {
    console.error(`Unexpected content between '}' and ']' in ${relPath}: "${between}"`);
    return;
  }

  const keySafe = relPath.replace(/\//g, '-');

  // We split at lastBraceIndex + 1 (immediately after the last question's closing brace)
  const beforeBrace = content.substring(0, lastBraceIndex + 1);
  const afterBrace = content.substring(lastBraceIndex + 1);

  // Format the new premium questions as MDX arrays
  const formattedQ1 = `,\n      {\n        quizId: "${keySafe}-quiz-premium",\n        question: \`${q1.question}\`,\n        options: [\n          ${q1.options.map(opt => `"${opt.replace(/"/g, '\\"')}"`).join(',\n          ')}\n        ],\n        correctIndex: ${q1.correctIndex},\n        hint: \`${q1.hint}\`,\n        isPremium: true\n      }`;

  const formattedQ2 = `,\n      {\n        quizId: "${q2.quizId}",\n        question: \`${q2.question}\`,\n        options: [\n          ${q2.options.map(opt => `"${opt.replace(/"/g, '\\"')}"`).join(',\n          ')}\n        ],\n        correctIndex: ${q2.correctIndex},\n        hint: \`${q2.hint}\`,\n        isPremium: true\n      }`;

  const newContent = beforeBrace + formattedQ1 + formattedQ2 + afterBrace;

  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`Successfully injected both premium questions into: ${relPath}`);
  successCount++;
});

console.log(`Completed. Successfully updated ${successCount} out of ${files.length} files.`);
