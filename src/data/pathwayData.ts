// Content for the Talent Pathway (Osaajapolku) section. Rules change — every
// item that depends on a regulation points to the official source instead of
// quoting amounts or deadlines that go stale.

export interface Bilingual {
    en: string;
    fi: string;
}

export interface PathwayLink {
    label: Bilingual;
    url: string;
    internal?: boolean;
}

export interface PathwayTask {
    id: string;
    title: Bilingual;
    detail: Bilingual;
    /** Shown in the Kela / DVV / Vero registration checklist. */
    registration?: boolean;
    link?: PathwayLink;
}

export interface PathwayPhase {
    id: string;
    /** Weeks before arrival this phase covers; negative = after arrival. */
    fromWeeks: number;
    toWeeks: number;
    title: Bilingual;
    when: Bilingual;
    tasks: PathwayTask[];
}

const L = {
    migri: { label: { en: 'Migri', fi: 'Migri' }, url: 'https://migri.fi/en' },
    enterFinland: { label: { en: 'Enter Finland', fi: 'Enter Finland' }, url: 'https://enterfinland.fi' },
    dvv: { label: { en: 'DVV', fi: 'DVV' }, url: 'https://dvv.fi/en' },
    moveNotice: { label: { en: 'muuttoilmoitus.fi', fi: 'muuttoilmoitus.fi' }, url: 'https://www.muuttoilmoitus.fi' },
    vero: { label: { en: 'Vero (Tax Administration)', fi: 'Verohallinto' }, url: 'https://www.vero.fi/en/' },
    kela: { label: { en: 'Kela', fi: 'Kela' }, url: 'https://www.kela.fi' },
    yths: { label: { en: 'FSHS (YTHS)', fi: 'YTHS' }, url: 'https://www.yths.fi/en/' },
    infoFinland: { label: { en: 'InfoFinland', fi: 'InfoFinland' }, url: 'https://www.infofinland.fi/en' },
    uusiKielemme: { label: { en: 'Uusi kielemme (free Finnish lessons)', fi: 'Uusi kielemme (ilmaiset suomen kielen oppitunnit)' }, url: 'https://uusikielemme.fi' },
    tyomarkkinatori: { label: { en: 'Job Market Finland', fi: 'Työmarkkinatori' }, url: 'https://tyomarkkinatori.fi/en' },
    oph: { label: { en: 'Recognition of qualifications (OPH)', fi: 'Tutkintojen tunnustaminen (OPH)' }, url: 'https://www.oph.fi/en/services/recognition-and-international-comparability-qualifications' },
    workInFinland: { label: { en: 'Work in Finland', fi: 'Work in Finland' }, url: 'https://www.workinfinland.com' },
    cvBuilder: { label: { en: 'Open CV Builder', fi: 'Avaa CV-työkalu' }, url: '/cv-builder', internal: true },
    jobs: { label: { en: 'Browse opportunities', fi: 'Selaa paikkoja' }, url: '/pathway/jobs', internal: true },
    mentorship: { label: { en: 'Find a mentor', fi: 'Löydä mentori' }, url: '/mentorship', internal: true },
    community: { label: { en: 'Open Community', fi: 'Avaa yhteisö' }, url: '/community', internal: true },
} satisfies Record<string, PathwayLink>;

export const pathwayPhases: PathwayPhase[] = [
    {
        id: 'admission',
        fromWeeks: 52,
        toWeeks: 12,
        title: { en: 'Right after admission', fi: 'Heti opiskelupaikan saamisen jälkeen' },
        when: { en: '12+ weeks before arrival', fi: 'Yli 12 viikkoa ennen saapumista' },
        tasks: [
            {
                id: 'accept-offer',
                title: { en: 'Accept your study place', fi: 'Ota opiskelupaikka vastaan' },
                detail: {
                    en: 'Confirm your place by the deadline in your admission letter and pay the tuition fee or confirm your scholarship. You need the acceptance letter for your residence permit.',
                    fi: 'Vahvista paikkasi hyväksymiskirjeen määräaikaan mennessä ja maksa lukuvuosimaksu tai varmista apurahasi. Tarvitset hyväksymiskirjeen oleskelulupahakemukseen.',
                },
            },
            {
                id: 'permit-apply',
                title: { en: 'Apply for a student residence permit', fi: 'Hae opiskelijan oleskelulupaa' },
                detail: {
                    en: 'Apply online in Enter Finland as soon as you have your acceptance letter. Processing can take weeks or months, so do not wait.',
                    fi: 'Hae lupaa verkossa Enter Finland -palvelussa heti, kun sinulla on hyväksymiskirje. Käsittely voi kestää viikkoja tai kuukausia, joten älä odota.',
                },
                link: L.enterFinland,
            },
            {
                id: 'permit-funds',
                title: { en: 'Prepare proof of sufficient funds', fi: 'Valmistele selvitys riittävistä varoista' },
                detail: {
                    en: 'Migri requires proof that you can support yourself during your studies. The required amount changes, so check the current figure on migri.fi before you apply.',
                    fi: 'Migri edellyttää selvitystä siitä, että pystyt elättämään itsesi opintojen aikana. Vaadittu summa muuttuu, joten tarkista ajantasainen summa migri.fi-sivuilta ennen hakemista.',
                },
                link: L.migri,
            },
            {
                id: 'permit-insurance',
                title: { en: 'Get health insurance that meets Migri’s requirements', fi: 'Hanki Migrin vaatimukset täyttävä sairausvakuutus' },
                detail: {
                    en: 'Students from outside the EU usually need private health insurance for the permit. Check the required coverage before you buy a policy.',
                    fi: 'EU:n ulkopuolelta tulevat opiskelijat tarvitsevat yleensä yksityisen sairausvakuutuksen oleskelulupaa varten. Tarkista vaadittu kattavuus ennen vakuutuksen ostamista.',
                },
                link: L.migri,
            },
            {
                id: 'permit-identity',
                title: { en: 'Verify your identity at a Finnish mission', fi: 'Todenna henkilöllisyytesi Suomen edustustossa' },
                detail: {
                    en: 'Your application is processed only after you have proven your identity in person at a Finnish embassy or service point. Book early and bring your passport and original documents.',
                    fi: 'Hakemustasi käsitellään vasta, kun olet todentanut henkilöllisyytesi henkilökohtaisesti Suomen edustustossa tai palvelupisteessä. Varaa aika ajoissa ja ota mukaan passi ja alkuperäiset asiakirjat.',
                },
            },
            {
                id: 'finnish-start',
                title: { en: 'Start learning Finnish basics', fi: 'Aloita suomen kielen alkeet' },
                detail: {
                    en: 'Even greetings and workplace basics help you get a part-time job during your studies. Use the waiting time: 15 minutes a day is enough to start.',
                    fi: 'Jo tervehdykset ja työelämän perussanasto auttavat saamaan osa-aikatyön opintojen aikana. Hyödynnä odotusaika: 15 minuuttia päivässä riittää alkuun.',
                },
                link: L.uusiKielemme,
            },
        ],
    },
    {
        id: 'preparing',
        fromWeeks: 12,
        toWeeks: 4,
        title: { en: 'Preparing to move', fi: 'Muuton valmistelu' },
        when: { en: '4–12 weeks before arrival', fi: '4–12 viikkoa ennen saapumista' },
        tasks: [
            {
                id: 'housing',
                title: { en: 'Apply for student housing', fi: 'Hae opiskelija-asuntoa' },
                detail: {
                    en: 'Student apartments fill up fast before the autumn term. Ask your institution which student housing foundation serves your city. Never pay a deposit to a landlord you cannot verify — rental scams target newcomers.',
                    fi: 'Opiskelija-asunnot täyttyvät nopeasti ennen syyslukukautta. Kysy oppilaitokseltasi, mikä opiskelija-asuntosäätiö toimii kaupungissasi. Älä koskaan maksa vakuusmaksua vuokranantajalle, jota et voi varmistaa – vuokrahuijaukset kohdistuvat usein uusiin tulijoihin.',
                },
            },
            {
                id: 'cv-finnish',
                title: { en: 'Create a Finland-style CV', fi: 'Tee suomalaistyylinen CV' },
                detail: {
                    en: 'Finnish employers expect a short, factual CV (1–2 pages) with a summary, concrete achievements and language skills. Make one now so you can apply as soon as you arrive.',
                    fi: 'Suomalaiset työnantajat odottavat lyhyttä ja asiallista CV:tä (1–2 sivua), jossa on tiivistelmä, konkreettiset saavutukset ja kielitaito. Tee se nyt, niin voit hakea töitä heti saavuttuasi.',
                },
                link: L.cvBuilder,
            },
            {
                id: 'jobs-explore',
                title: { en: 'Explore part-time jobs and internships in your region', fi: 'Tutustu alueesi osa-aikatöihin ja harjoittelupaikkoihin' },
                detail: {
                    en: 'A student residence permit lets you work alongside your studies, with limits on weekly hours during term. Check the current limits on migri.fi and look at what local employers offer.',
                    fi: 'Opiskelijan oleskelulupa sallii työskentelyn opintojen ohessa, mutta lukukauden aikaisia viikkotunteja on rajoitettu. Tarkista ajantasaiset rajat migri.fi-sivuilta ja katso, mitä alueen työnantajat tarjoavat.',
                },
                link: L.jobs,
            },
            {
                id: 'mentor',
                title: { en: 'Find a mentor who has done this before', fi: 'Löydä mentori, joka on kokenut saman' },
                detail: {
                    en: 'Ask someone who moved to Finland before you about housing, studies and work. Mentorship on Talent Factory is anonymous and private.',
                    fi: 'Kysy sinua aiemmin Suomeen muuttaneelta asumisesta, opiskelusta ja työstä. Talent Factoryn mentorointi on anonyymiä ja yksityistä.',
                },
                link: L.mentorship,
            },
            {
                id: 'documents',
                title: { en: 'Collect original documents', fi: 'Kokoa alkuperäiset asiakirjat' },
                detail: {
                    en: 'Bring degree certificates, transcripts and — if family is coming — birth and marriage certificates. Many authorities require legalised documents and official translations.',
                    fi: 'Ota mukaan tutkintotodistukset, opintosuoritusotteet ja – jos perhe tulee mukaan – syntymä- ja vihkitodistukset. Monet viranomaiset vaativat laillistetut asiakirjat ja viralliset käännökset.',
                },
            },
            {
                id: 'budget',
                title: { en: 'Make a budget for the first three months', fi: 'Laadi budjetti kolmelle ensimmäiselle kuukaudelle' },
                detail: {
                    en: 'Plan for the rent deposit, the first rent, the FSHS healthcare fee, a transport pass, winter clothing and basic furniture before your first salary or grant payment arrives.',
                    fi: 'Varaudu vuokravakuuteen, ensimmäiseen vuokraan, YTHS-terveydenhoitomaksuun, matkakorttiin, talvivaatteisiin ja perushuonekaluihin ennen ensimmäistä palkkaa tai apurahaa.',
                },
            },
        ],
    },
    {
        id: 'final',
        fromWeeks: 4,
        toWeeks: 0,
        title: { en: 'Final weeks before departure', fi: 'Viimeiset viikot ennen lähtöä' },
        when: { en: '0–4 weeks before arrival', fi: '0–4 viikkoa ennen saapumista' },
        tasks: [
            {
                id: 'permit-card',
                title: { en: 'Receive your residence permit card', fi: 'Vastaanota oleskelulupakorttisi' },
                detail: {
                    en: 'Check where your card will be delivered. You need it to enter Finland, open a bank account and register with authorities.',
                    fi: 'Tarkista, mihin korttisi toimitetaan. Tarvitset sitä maahan saapumiseen, pankkitilin avaamiseen ja viranomaisrekisteröinteihin.',
                },
                link: L.migri,
            },
            {
                id: 'travel',
                title: { en: 'Book travel and tell your tutor when you arrive', fi: 'Varaa matkat ja kerro tuutorillesi saapumisaikasi' },
                detail: {
                    en: 'Many institutions run arrival days and tutor pick-ups. Tell them your arrival time so someone can meet you and hand over your apartment keys.',
                    fi: 'Monet oppilaitokset järjestävät saapumispäiviä ja tuutorien vastaanottoja. Kerro saapumisaikasi, jotta joku voi tulla vastaan ja luovuttaa asunnon avaimet.',
                },
            },
            {
                id: 'climate',
                title: { en: 'Pack for the climate', fi: 'Pakkaa ilmaston mukaan' },
                detail: {
                    en: 'Bring layers. Proper winter gear is easy to buy in Finland, also second-hand at flea markets (kirpputori) — especially important if you study in Lapland or Eastern Finland.',
                    fi: 'Ota mukaan kerrospukeutumiseen sopivia vaatteita. Kunnollisia talvivarusteita saa helposti Suomesta, myös käytettyinä kirpputoreilta – erityisen tärkeää, jos opiskelet Lapissa tai Itä-Suomessa.',
                },
            },
            {
                id: 'orientation',
                title: { en: 'Sign up for orientation and the student union', fi: 'Ilmoittaudu orientaatioon ja opiskelijakuntaan' },
                detail: {
                    en: 'Orientation week is where you meet classmates, tutors and local employers. Student union membership gives you a student card and discounts.',
                    fi: 'Orientaatioviikolla tapaat opiskelukaverit, tuutorit ja alueen työnantajia. Opiskelijakunnan jäsenyys tuo opiskelijakortin ja alennuksia.',
                },
            },
        ],
    },
    {
        id: 'first-week',
        fromWeeks: 0,
        toWeeks: -1,
        title: { en: 'Your first week in Finland', fi: 'Ensimmäinen viikkosi Suomessa' },
        when: { en: 'Days 1–7 after arrival', fi: 'Päivät 1–7 saapumisen jälkeen' },
        tasks: [
            {
                id: 'dvv-register',
                registration: true,
                title: { en: 'Register at DVV', fi: 'Rekisteröidy DVV:ssä' },
                detail: {
                    en: 'Register your address and, if you did not get one with your permit, your Finnish personal identity code. Ask DVV whether you can get a municipality of residence (kotikunta) — it affects access to public services.',
                    fi: 'Rekisteröi osoitteesi ja, jos et saanut sitä oleskeluluvan yhteydessä, suomalainen henkilötunnus. Kysy DVV:ltä, voitko saada kotikunnan – se vaikuttaa julkisten palvelujen saatavuuteen.',
                },
                link: L.dvv,
            },
            {
                id: 'move-notice',
                registration: true,
                title: { en: 'Submit a move notification', fi: 'Tee muuttoilmoitus' },
                detail: {
                    en: 'Notify your new address within one week of moving in. Once you have online banking IDs you can do it online; mail will then reach you.',
                    fi: 'Ilmoita uusi osoitteesi viikon kuluessa muutosta. Kun sinulla on verkkopankkitunnukset, voit tehdä ilmoituksen verkossa; posti löytää sinut sen jälkeen.',
                },
                link: L.moveNotice,
            },
            {
                id: 'bank',
                registration: true,
                title: { en: 'Open a bank account and get online banking IDs', fi: 'Avaa pankkitili ja hanki verkkopankkitunnukset' },
                detail: {
                    en: 'Book an appointment and bring your passport and permit card. Online banking IDs are your strong electronic identification for Kela, Vero and Suomi.fi.',
                    fi: 'Varaa aika ja ota mukaan passi ja oleskelulupakortti. Verkkopankkitunnukset ovat vahva sähköinen tunnistautumisesi Kelan, Verohallinnon ja Suomi.fi:n palveluihin.',
                },
            },
            {
                id: 'tax-card',
                registration: true,
                title: { en: 'Get a tax card before your first payday', fi: 'Hanki verokortti ennen ensimmäistä palkkapäivää' },
                detail: {
                    en: 'Without a tax card your employer must withhold 60 % tax. Apply in OmaVero or at a tax office; you need your personal identity code.',
                    fi: 'Ilman verokorttia työnantajan on pidätettävä palkasta 60 % veroa. Hae verokortti OmaVerossa tai verotoimistossa; tarvitset henkilötunnuksen.',
                },
                link: L.vero,
            },
            {
                id: 'kela-check',
                registration: true,
                title: { en: 'Check your Kela coverage', fi: 'Selvitä Kela-turvasi' },
                detail: {
                    en: 'Whether you are covered by Finnish social security depends on your situation. Apply for a decision from Kela if you may be eligible — it affects benefits and healthcare costs.',
                    fi: 'Kuulumisesi Suomen sosiaaliturvaan riippuu tilanteestasi. Hae Kelalta päätöstä, jos voit olla oikeutettu – se vaikuttaa etuuksiin ja terveydenhuollon kustannuksiin.',
                },
                link: L.kela,
            },
            {
                id: 'fshs-fee',
                registration: true,
                title: { en: 'Pay the FSHS student healthcare fee', fi: 'Maksa YTHS:n terveydenhoitomaksu' },
                detail: {
                    en: 'Higher education degree students pay the student healthcare fee to Kela every term. It gives access to the Finnish Student Health Service (FSHS / YTHS).',
                    fi: 'Korkeakoulujen tutkinto-opiskelijat maksavat terveydenhoitomaksun Kelalle joka lukukausi. Se oikeuttaa Ylioppilaiden terveydenhoitosäätiön (YTHS) palveluihin.',
                },
                link: L.yths,
            },
            {
                id: 'sim',
                title: { en: 'Get a Finnish phone number', fi: 'Hanki suomalainen puhelinnumero' },
                detail: {
                    en: 'A prepaid SIM card from any kiosk or supermarket is enough to start. Employers and authorities will call or text you.',
                    fi: 'Kioskilta tai ruokakaupasta saatava prepaid-liittymä riittää alkuun. Työnantajat ja viranomaiset soittavat tai lähettävät tekstiviestejä.',
                },
            },
        ],
    },
    {
        id: 'first-month',
        fromWeeks: -1,
        toWeeks: -5,
        title: { en: 'Your first month', fi: 'Ensimmäinen kuukausi' },
        when: { en: 'Weeks 2–5 after arrival', fi: 'Viikot 2–5 saapumisen jälkeen' },
        tasks: [
            {
                id: 'finnish-course',
                title: { en: 'Enrol in a Finnish course', fi: 'Ilmoittaudu suomen kielen kurssille' },
                detail: {
                    en: 'Most institutions offer Finnish courses that count towards your degree. Knowing Finnish is one of the strongest predictors of finding work and staying in the region.',
                    fi: 'Useimmat oppilaitokset tarjoavat tutkintoon laskettavia suomen kielen kursseja. Suomen kielen taito on yksi vahvimmista tekijöistä työllistymisessä ja alueelle jäämisessä.',
                },
            },
            {
                id: 'network',
                title: { en: 'Meet local employers', fi: 'Tapaa alueen työnantajia' },
                detail: {
                    en: 'Go to at least one career event, company visit or recruitment fair. In Finland many jobs are filled through contacts before they are ever advertised.',
                    fi: 'Osallistu vähintään yhteen urailtaan, yritysvierailuun tai rekrytointimessuille. Suomessa monet työpaikat täytetään verkostojen kautta ennen kuin niitä edes ilmoitetaan.',
                },
                link: L.jobs,
            },
            {
                id: 'community-join',
                title: { en: 'Introduce yourself in the community', fi: 'Esittäydy yhteisössä' },
                detail: {
                    en: 'Ask questions, share what you learned and connect with other international students in your city.',
                    fi: 'Kysy kysymyksiä, jaa oppimaasi ja tutustu muihin kaupunkisi kansainvälisiin opiskelijoihin.',
                },
                link: L.community,
            },
        ],
    },
];

export const pathwayTaskIds = pathwayPhases.flatMap((p) => p.tasks.map((t) => t.id));

export type PermitStatus =
    | 'not_started'
    | 'submitted'
    | 'identity_verified'
    | 'additional_info'
    | 'decision_positive'
    | 'card_received';

export const permitSteps: { status: PermitStatus; label: Bilingual; hint: Bilingual }[] = [
    {
        status: 'not_started',
        label: { en: 'Not started', fi: 'Ei aloitettu' },
        hint: { en: 'Apply in Enter Finland as soon as you have your acceptance letter.', fi: 'Hae Enter Finland -palvelussa heti, kun sinulla on hyväksymiskirje.' },
    },
    {
        status: 'submitted',
        label: { en: 'Application submitted', fi: 'Hakemus jätetty' },
        hint: { en: 'Next: book a visit to verify your identity at a Finnish mission.', fi: 'Seuraavaksi: varaa aika henkilöllisyyden todentamiseen Suomen edustustossa.' },
    },
    {
        status: 'identity_verified',
        label: { en: 'Identity verified', fi: 'Henkilöllisyys todennettu' },
        hint: { en: 'Your application is now in processing. Check Migri’s current processing times.', fi: 'Hakemuksesi on nyt käsittelyssä. Tarkista Migrin ajantasaiset käsittelyajat.' },
    },
    {
        status: 'additional_info',
        label: { en: 'Additional information requested', fi: 'Lisäselvityspyyntö' },
        hint: { en: 'Reply by the deadline in Enter Finland — late replies delay or end the process.', fi: 'Vastaa määräaikaan mennessä Enter Finlandissa – myöhästynyt vastaus viivästyttää tai keskeyttää käsittelyn.' },
    },
    {
        status: 'decision_positive',
        label: { en: 'Positive decision', fi: 'Myönteinen päätös' },
        hint: { en: 'Congratulations! Next: make sure you know where your card will be delivered.', fi: 'Onnittelut! Seuraavaksi: varmista, mihin korttisi toimitetaan.' },
    },
    {
        status: 'card_received',
        label: { en: 'Permit card received', fi: 'Oleskelulupakortti vastaanotettu' },
        hint: { en: 'You are ready to travel. Keep the card with your passport.', fi: 'Olet valmis matkaan. Säilytä korttia passin kanssa.' },
    },
];

export const firstWeekTips: { title: Bilingual; body: Bilingual }[] = [
    {
        title: { en: 'Emergency numbers', fi: 'Hätänumerot' },
        body: {
            en: '112 for police, ambulance and fire. For urgent medical advice that is not an emergency, call the medical helpline 116 117.',
            fi: '112 poliisille, ambulanssille ja palokunnalle. Kiireelliseen terveysneuvontaan, joka ei ole hätätilanne, soita Päivystysapuun 116 117.',
        },
    },
    {
        title: { en: 'Strong identification first', fi: 'Ensin vahva tunnistautuminen' },
        body: {
            en: 'Almost every e-service (Kela, Vero, Suomi.fi, health services) needs online banking IDs or a mobile certificate. Getting them early saves many office visits.',
            fi: 'Lähes jokainen sähköinen palvelu (Kela, Verohallinto, Suomi.fi, terveyspalvelut) vaatii verkkopankkitunnukset tai mobiilivarmenteen. Kun hankit ne ajoissa, säästyt monelta asioinnilta.',
        },
    },
    {
        title: { en: 'Getting around', fi: 'Liikkuminen' },
        body: {
            en: 'Download your city’s public transport app, for example Vilkku in Kuopio, Linkkari in Rovaniemi or JOJO in Joensuu. A student card gives discounts on long-distance trains and buses.',
            fi: 'Lataa kaupunkisi joukkoliikennesovellus, esimerkiksi Vilkku Kuopiossa, Linkkari Rovaniemellä tai JOJO Joensuussa. Opiskelijakortilla saat alennusta kaukojunista ja -busseista.',
        },
    },
    {
        title: { en: 'Living in an apartment building', fi: 'Kerrostaloasuminen' },
        body: {
            en: 'Quiet hours are usually 22–07. Sort waste into biowaste, cardboard, plastic, glass and metal — instructions are in your building’s waste room. Tap water is safe to drink.',
            fi: 'Hiljaisuus on yleensä klo 22–07. Lajittele jätteet biojätteeseen, kartonkiin, muoviin, lasiin ja metalliin – ohjeet löytyvät talon jätekatoksesta. Hanavesi on juomakelpoista.',
        },
    },
    {
        title: { en: 'Darkness and winter', fi: 'Pimeys ja talvi' },
        body: {
            en: 'Days are short from November to January, especially in the north. Keep a routine, go outside in daylight and ask a nurse at FSHS about vitamin D. Wear a reflector (heijastin) when walking in the dark.',
            fi: 'Päivät ovat lyhyitä marras–tammikuussa, erityisesti pohjoisessa. Pidä kiinni rutiineista, ulkoile valoisaan aikaan ja kysy YTHS:n hoitajalta D-vitamiinista. Käytä heijastinta liikkuessasi pimeällä.',
        },
    },
    {
        title: { en: 'Ask — Finns are helpful', fi: 'Kysy – suomalaiset auttavat' },
        body: {
            en: 'Finns rarely start small talk, but they are happy to help when asked directly. Your tutor, student union and institution’s international services are there for you.',
            fi: 'Suomalaiset aloittavat harvoin small talkia, mutta auttavat mielellään, kun heiltä kysytään suoraan. Tuutorisi, opiskelijakuntasi ja oppilaitoksesi kansainväliset palvelut ovat tukenasi.',
        },
    },
];

export interface FamilySection {
    id: string;
    icon: 'permit' | 'work' | 'daycare' | 'school' | 'health' | 'language' | 'social';
    title: Bilingual;
    intro: Bilingual;
    points: Bilingual[];
    links: PathwayLink[];
}

export const familySections: FamilySection[] = [
    {
        id: 'family-permit',
        icon: 'permit',
        title: { en: 'Residence permits for family members', fi: 'Perheenjäsenten oleskeluluvat' },
        intro: {
            en: 'Your spouse and children need their own residence permits. The rules for students’ family members have changed in recent years, so check eligibility before you make plans.',
            fi: 'Puolisosi ja lapsesi tarvitsevat omat oleskelulupansa. Opiskelijoiden perheenjäseniä koskevat säännöt ovat muuttuneet viime vuosina, joten tarkista edellytykset ennen suunnitelmien tekemistä.',
        },
        points: [
            { en: 'Family members apply in Enter Finland and verify their identity at a Finnish mission, just like you.', fi: 'Perheenjäsenet hakevat lupaa Enter Finlandissa ja todentavat henkilöllisyytensä Suomen edustustossa, kuten sinäkin.' },
            { en: 'An income requirement usually applies to the whole family — Migri publishes the current amounts.', fi: 'Koko perhettä koskee yleensä toimeentuloedellytys – Migri julkaisee ajantasaiset summat.' },
            { en: 'Bring legalised marriage and birth certificates with official translations.', fi: 'Ota mukaan laillistetut vihki- ja syntymätodistukset virallisine käännöksineen.' },
        ],
        links: [L.migri, L.enterFinland],
    },
    {
        id: 'spouse-work',
        icon: 'work',
        title: { en: 'Job search for spouses', fi: 'Puolison työnhaku' },
        intro: {
            en: 'A working spouse is one of the main reasons international families stay in a region. Start the job search early — many spouses arrive with strong professional backgrounds.',
            fi: 'Puolison työllistyminen on yksi tärkeimmistä syistä, miksi kansainväliset perheet jäävät alueelle. Aloita työnhaku ajoissa – monella puolisolla on vahva ammatillinen tausta.',
        },
        points: [
            { en: 'A family member’s residence permit usually includes the right to work — check the permit card.', fi: 'Perheenjäsenen oleskelulupaan sisältyy yleensä oikeus työntekoon – tarkista oleskelulupakortista.' },
            { en: 'Register as a job seeker with your local employment services. Since 2025 they are run by municipalities and employment areas (työllisyysalue).', fi: 'Ilmoittaudu työnhakijaksi paikallisiin työllisyyspalveluihin. Vuodesta 2025 alkaen niitä järjestävät kunnat ja työllisyysalueet.' },
            { en: 'Check whether your qualification needs official recognition — this is required in regulated professions such as healthcare and teaching.', fi: 'Tarkista, tarvitseeko tutkintosi virallisen tunnustamisen – se vaaditaan säännellyissä ammateissa, kuten terveydenhuollossa ja opetuksessa.' },
            { en: 'Make a Finnish-style CV and connect with a mentor in your field.', fi: 'Tee suomalaistyylinen CV ja hanki oman alasi mentori.' },
        ],
        links: [L.tyomarkkinatori, L.oph, L.workInFinland, L.cvBuilder],
    },
    {
        id: 'daycare',
        icon: 'daycare',
        title: { en: 'Early childhood education (daycare)', fi: 'Varhaiskasvatus' },
        intro: {
            en: 'Finnish early childhood education (varhaiskasvatus) is high quality and open to every child living in the municipality. Fees depend on family income.',
            fi: 'Suomalainen varhaiskasvatus on laadukasta ja avoinna jokaiselle kunnassa asuvalle lapselle. Maksut määräytyvät perheen tulojen mukaan.',
        },
        points: [
            { en: 'Apply at least four months before you need a place — or two weeks before if you start a job or studies at short notice.', fi: 'Hae paikkaa vähintään neljä kuukautta ennen tarvetta – tai kaksi viikkoa ennen, jos aloitat työn tai opinnot äkillisesti.' },
            { en: 'Child health clinics (neuvola) follow your child’s growth and vaccinations free of charge.', fi: 'Lastenneuvola seuraa lapsesi kasvua ja rokotuksia maksutta.' },
            { en: 'Some cities have English-language or bilingual groups — ask your municipality.', fi: 'Joissakin kaupungeissa on englanninkielisiä tai kaksikielisiä ryhmiä – kysy kunnaltasi.' },
        ],
        links: [L.infoFinland],
    },
    {
        id: 'school',
        icon: 'school',
        title: { en: 'School', fi: 'Koulu' },
        intro: {
            en: 'Comprehensive school is free, including school meals and materials. Children start pre-primary education the year before school.',
            fi: 'Perusopetus on maksutonta, ja se sisältää kouluruoan ja oppimateriaalit. Lapset aloittavat esiopetuksen koulualoitusta edeltävänä vuonna.',
        },
        points: [
            { en: 'Pre-primary education starts at age 6 and school in the autumn of the year the child turns 7.', fi: 'Esiopetus alkaa 6-vuotiaana ja koulu sen vuoden syksynä, jona lapsi täyttää 7 vuotta.' },
            { en: 'Newcomers can get preparatory education (valmistava opetus) and Finnish as a second language (S2) teaching.', fi: 'Maahan muuttaneet lapset voivat saada perusopetukseen valmistavaa opetusta ja suomi toisena kielenä (S2) -opetusta.' },
            { en: 'Your child can often keep studying their mother tongue in supplementary lessons.', fi: 'Lapsesi voi usein jatkaa oman äidinkielensä opiskelua täydentävässä opetuksessa.' },
        ],
        links: [L.infoFinland],
    },
    {
        id: 'health',
        icon: 'health',
        title: { en: 'Healthcare for the family', fi: 'Perheen terveydenhuolto' },
        intro: {
            en: 'Access to public healthcare depends on whether family members have a municipality of residence in Finland. Without one, private insurance is essential.',
            fi: 'Julkisten terveyspalvelujen saatavuus riippuu siitä, onko perheenjäsenillä kotikunta Suomessa. Ilman sitä yksityinen vakuutus on välttämätön.',
        },
        points: [
            { en: 'Public health services are organised by wellbeing services counties (hyvinvointialue).', fi: 'Julkiset terveyspalvelut järjestävät hyvinvointialueet.' },
            { en: 'FSHS (YTHS) serves degree students only — not their spouses or children.', fi: 'YTHS palvelee vain tutkinto-opiskelijoita – ei heidän puolisoitaan tai lapsiaan.' },
            { en: 'In an emergency call 112; for medical advice call 116 117.', fi: 'Hätätilanteessa soita 112; terveysneuvontaa saat numerosta 116 117.' },
        ],
        links: [L.infoFinland, L.kela],
    },
    {
        id: 'language',
        icon: 'language',
        title: { en: 'Finnish and integration for the whole family', fi: 'Suomen kieli ja kotoutuminen koko perheelle' },
        intro: {
            en: 'Spouses often have more time to learn Finnish than students — and it pays off quickly in the job market.',
            fi: 'Puolisoilla on usein enemmän aikaa opiskella suomea kuin opiskelijoilla – ja se kannattaa nopeasti työmarkkinoilla.',
        },
        points: [
            { en: 'Ask your municipality about integration services (kotoutumispalvelut) and free Finnish courses.', fi: 'Kysy kunnaltasi kotoutumispalveluista ja maksuttomista suomen kielen kursseista.' },
            { en: 'Adult education centres (kansalaisopisto) offer affordable evening courses.', fi: 'Kansalaisopistot tarjoavat edullisia iltakursseja.' },
            { en: 'Public libraries are free and host language cafés, events and children’s activities.', fi: 'Yleiset kirjastot ovat maksuttomia, ja niissä järjestetään kielikahviloita, tapahtumia ja lasten toimintaa.' },
        ],
        links: [L.infoFinland, L.uusiKielemme],
    },
    {
        id: 'social',
        icon: 'social',
        title: { en: 'Social life and spouse community', fi: 'Sosiaalinen elämä ja puolisoyhteisö' },
        intro: {
            en: 'Loneliness is the most common reason families leave. Building a network in the first months makes the region feel like home.',
            fi: 'Yksinäisyys on yleisin syy, miksi perheet muuttavat pois. Verkoston rakentaminen ensimmäisinä kuukausina tekee alueesta kodin.',
        },
        points: [
            { en: 'Family cafés (perhekahvila) run by parishes and family organisations are free and welcoming.', fi: 'Seurakuntien ja perhejärjestöjen perhekahvilat ovat maksuttomia ja avoimia kaikille.' },
            { en: 'Join hobby groups, sports clubs or volunteering — the easiest way to meet Finns.', fi: 'Liity harrastusryhmiin, urheiluseuroihin tai vapaaehtoistoimintaan – helpoin tapa tutustua suomalaisiin.' },
            { en: 'Connect with other spouses on Talent Factory: choose “Spouses & Family” in Mentorship or post in the Community.', fi: 'Tutustu muihin puolisoihin Talent Factoryssa: valitse mentoroinnissa ”Spouses & Family” tai kirjoita yhteisöön.' },
        ],
        links: [L.mentorship, L.community],
    },
];

export const jobRegions: { id: string; label: Bilingual }[] = [
    { id: 'lapland', label: { en: 'Lapland', fi: 'Lappi' } },
    { id: 'north-savo', label: { en: 'North Savo', fi: 'Pohjois-Savo' } },
    { id: 'north-karelia', label: { en: 'North Karelia', fi: 'Pohjois-Karjala' } },
    { id: 'north-ostrobothnia', label: { en: 'North Ostrobothnia', fi: 'Pohjois-Pohjanmaa' } },
    { id: 'central-finland', label: { en: 'Central Finland', fi: 'Keski-Suomi' } },
    { id: 'pirkanmaa', label: { en: 'Pirkanmaa', fi: 'Pirkanmaa' } },
    { id: 'southwest-finland', label: { en: 'Southwest Finland', fi: 'Varsinais-Suomi' } },
    { id: 'uusimaa', label: { en: 'Uusimaa', fi: 'Uusimaa' } },
    { id: 'other', label: { en: 'Other region', fi: 'Muu alue' } },
    { id: 'remote', label: { en: 'Remote', fi: 'Etätyö' } },
];

export type JobType = 'internship' | 'part_time' | 'summer' | 'thesis';

export const jobTypes: { id: JobType; label: Bilingual }[] = [
    { id: 'internship', label: { en: 'Internship', fi: 'Harjoittelu' } },
    { id: 'part_time', label: { en: 'Part-time job', fi: 'Osa-aikatyö' } },
    { id: 'summer', label: { en: 'Summer job', fi: 'Kesätyö' } },
    { id: 'thesis', label: { en: 'Thesis position', fi: 'Opinnäytetyö' } },
];
