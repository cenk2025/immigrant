export interface GuideSection {
    id: string;
    title: string;
    icon: string;
    content: {
        en: {
            introduction: string;
            sections: {
                title: string;
                content: string;
            }[];
            keyPoints: string[];
        };
        fi: {
            introduction: string;
            sections: {
                title: string;
                content: string;
            }[];
            keyPoints: string[];
        };
    };
}

export const guideData: GuideSection[] = [
    {
        id: 'work-culture',
        title: 'Finnish Work Culture & Expectations',
        icon: 'Users',
        content: {
            en: {
                introduction: 'Finnish work culture is characterized by equality, trust, and efficiency. Understanding these cultural norms is essential for successful integration into Finnish working life.',
                sections: [
                    {
                        title: 'Equality and Flat Hierarchies',
                        content: 'Finnish workplaces typically have flat organizational structures. Employees at all levels are expected to contribute ideas and participate in decision-making. Titles matter less than competence and results.'
                    },
                    {
                        title: 'Direct Communication',
                        content: 'Finns value honest, direct communication. Silence is not uncomfortable but rather a sign of thoughtful consideration. Small talk is minimal, and conversations focus on substance rather than formality.'
                    },
                    {
                        title: 'Punctuality and Reliability',
                        content: 'Being on time is crucial in Finnish culture. Meetings start and end as scheduled. If you cannot meet a deadline or attend a meeting, inform others well in advance.'
                    },
                    {
                        title: 'Work-Life Balance',
                        content: 'Finns highly value work-life balance. Working overtime is not expected or encouraged. Employees are trusted to manage their time effectively and deliver results within working hours.'
                    },
                    {
                        title: 'Trust and Autonomy',
                        content: 'Finnish work culture is built on trust. Employees are given significant autonomy and are expected to take responsibility for their work without constant supervision.'
                    }
                ],
                keyPoints: [
                    'Equality is fundamental - everyone\'s opinion matters',
                    'Be direct and honest in communication',
                    'Punctuality shows respect',
                    'Work-life balance is protected and valued',
                    'Trust and autonomy come with responsibility'
                ]
            },
            fi: {
                introduction: 'Suomalaista työkulttuuria leimaa tasa-arvo, luottamus ja tehokkuus. Näiden kulttuuristen normien ymmärtäminen on olennaista onnistuneelle integroitumiselle suomalaiseen työelämään.',
                sections: [
                    {
                        title: 'Tasa-arvo ja Matalat Hierarkiat',
                        content: 'Suomalaisilla työpaikoilla on tyypillisesti matalat organisaatiorakenteet. Kaikkien tasojen työntekijöiltä odotetaan ideoiden esittämistä ja osallistumista päätöksentekoon. Tittelit merkitsevät vähemmän kuin osaaminen ja tulokset.'
                    },
                    {
                        title: 'Suora Viestintä',
                        content: 'Suomalaiset arvostavat rehellistä, suoraa viestintää. Hiljaisuus ei ole kiusallista vaan pikemminkin merkki harkitusta pohdinnasta. Pienet puheet ovat vähäisiä, ja keskustelut keskittyvät asiaan muodollisuuden sijaan.'
                    },
                    {
                        title: 'Täsmällisyys ja Luotettavuus',
                        content: 'Ajoissa oleminen on ratkaisevan tärkeää suomalaisessa kulttuurissa. Kokoukset alkavat ja päättyvät aikataulun mukaisesti. Jos et voi noudattaa määräaikaa tai osallistua kokoukseen, ilmoita muille hyvissä ajoin.'
                    },
                    {
                        title: 'Työn ja Vapaa-ajan Tasapaino',
                        content: 'Suomalaiset arvostavat suuresti työn ja vapaa-ajan tasapainoa. Ylitöitä ei odoteta eikä kannusteta. Työntekijöihin luotetaan, että he hallitsevat aikansa tehokkaasti ja tuottavat tuloksia työaikana.'
                    },
                    {
                        title: 'Luottamus ja Autonomia',
                        content: 'Suomalainen työkulttuuri perustuu luottamukseen. Työntekijöille annetaan merkittävää autonomiaa, ja heidän odotetaan ottavan vastuun työstään ilman jatkuvaa valvontaa.'
                    }
                ],
                keyPoints: [
                    'Tasa-arvo on perustavaa - jokaisen mielipide on tärkeä',
                    'Ole suora ja rehellinen viestinnässä',
                    'Täsmällisyys osoittaa kunnioitusta',
                    'Työn ja vapaa-ajan tasapaino on suojattu ja arvostettu',
                    'Luottamus ja autonomia tuovat mukanaan vastuun'
                ]
            }
        }
    },
    {
        id: 'employment-contracts',
        title: 'Employment Contracts',
        icon: 'FileText',
        content: {
            en: {
                introduction: 'Employment contracts in Finland are legally binding agreements that define the terms of employment. Understanding your contract is crucial for protecting your rights.',
                sections: [
                    {
                        title: 'Types of Contracts',
                        content: 'Employment contracts can be permanent (indefinite) or fixed-term (temporary). Permanent contracts are the standard and provide more job security. Fixed-term contracts must have a valid reason and specific end date.'
                    },
                    {
                        title: 'Probation Period',
                        content: 'New employment typically includes a probation period (koeaika) of up to 6 months. During this time, either party can terminate the contract with shorter notice. The probation period must be agreed in writing.'
                    },
                    {
                        title: 'Essential Contract Terms',
                        content: 'Your contract must include: job title and duties, start date, salary and payment schedule, working hours, holiday entitlement, notice period, and applicable collective agreement if any.'
                    },
                    {
                        title: 'Notice Periods',
                        content: 'Notice periods vary based on employment duration. During probation, notice is typically 14 days. After probation, it ranges from 14 days to 6 months depending on how long you\'ve worked for the employer.'
                    },
                    {
                        title: 'Contract Amendments',
                        content: 'Any changes to your employment contract must be agreed upon in writing. Significant changes to working conditions require your consent and cannot be imposed unilaterally.'
                    }
                ],
                keyPoints: [
                    'Always get your contract in writing',
                    'Understand the probation period terms',
                    'Know your notice period requirements',
                    'Fixed-term contracts need valid justification',
                    'Contract changes require written agreement'
                ]
            },
            fi: {
                introduction: 'Työsopimukset Suomessa ovat oikeudellisesti sitovia sopimuksia, jotka määrittelevät työsuhteen ehdot. Sopimuksesi ymmärtäminen on ratkaisevan tärkeää oikeuksiesi suojaamiseksi.',
                sections: [
                    {
                        title: 'Sopimusten Tyypit',
                        content: 'Työsopimukset voivat olla toistaiseksi voimassa olevia tai määräaikaisia. Toistaiseksi voimassa olevat sopimukset ovat standardi ja tarjoavat enemmän työturvallisuutta. Määräaikaisilla sopimuksilla on oltava pätevä syy ja tietty päättymispäivä.'
                    },
                    {
                        title: 'Koeaika',
                        content: 'Uusi työsuhde sisältää tyypillisesti enintään 6 kuukauden koeajan. Tänä aikana kumpi tahansa osapuoli voi irtisanoa sopimuksen lyhyemmällä irtisanomisajalla. Koeaika on sovittava kirjallisesti.'
                    },
                    {
                        title: 'Olennaiset Sopimusehdot',
                        content: 'Sopimuksessasi on oltava: tehtävänimike ja työtehtävät, aloituspäivä, palkka ja maksuaikataulu, työajat, lomaoikeus, irtisanomisaika ja sovellettava työehtosopimus, jos sellainen on.'
                    },
                    {
                        title: 'Irtisanomisajat',
                        content: 'Irtisanomisajat vaihtelevat työsuhteen keston mukaan. Koeaikana irtisanomisaika on tyypillisesti 14 päivää. Koeajan jälkeen se vaihtelee 14 päivästä 6 kuukauteen riippuen siitä, kuinka kauan olet työskennellyt työnantajalle.'
                    },
                    {
                        title: 'Sopimusmuutokset',
                        content: 'Kaikki työsopimuksesi muutokset on sovittava kirjallisesti. Merkittävät muutokset työolosuhteisiin vaativat suostumuksesi, eikä niitä voida määrätä yksipuolisesti.'
                    }
                ],
                keyPoints: [
                    'Hanki aina sopimus kirjallisena',
                    'Ymmärrä koeajan ehdot',
                    'Tiedä irtisanomisaikavaatimuksesi',
                    'Määräaikaiset sopimukset tarvitsevat pätevän perustelun',
                    'Sopimusmuutokset vaativat kirjallisen sopimuksen'
                ]
            }
        }
    },
    {
        id: 'working-hours',
        title: 'Working Hours & Holidays',
        icon: 'Clock',
        content: {
            en: {
                introduction: 'Finnish labor law strictly regulates working hours and holiday entitlements to ensure employee well-being and work-life balance.',
                sections: [
                    {
                        title: 'Regular Working Hours',
                        content: 'Standard working time is 8 hours per day and 40 hours per week. However, many workplaces have flexible arrangements. Working hours are often regulated by collective agreements, which may provide better terms than the minimum legal requirements.'
                    },
                    {
                        title: 'Overtime',
                        content: 'Overtime work must be compensated either with increased pay or compensatory time off. The first 8 hours of overtime per week are compensated at 150%, and hours beyond that at 200%. Overtime is not mandatory and should be agreed upon.'
                    },
                    {
                        title: 'Annual Holiday',
                        content: 'Employees earn 2 days of holiday per month during the first year, and 2.5 days per month after one year of employment. This equals 24-30 days of paid vacation annually. Holiday pay is typically 1.5 times the regular salary.'
                    },
                    {
                        title: 'Public Holidays',
                        content: 'Finland has several public holidays including New Year\'s Day, Epiphany, Good Friday, Easter, May Day, Midsummer, Independence Day, and Christmas. Work on public holidays is compensated with double pay or compensatory time off.'
                    },
                    {
                        title: 'Breaks and Rest Periods',
                        content: 'Employees are entitled to breaks during the workday. After 6 hours of work, a break of at least 30 minutes is required. Daily rest period must be at least 11 consecutive hours, and weekly rest at least 35 hours.'
                    }
                ],
                keyPoints: [
                    'Standard work week is 40 hours',
                    'Overtime requires compensation',
                    'Annual holiday is 24-30 days',
                    'Public holidays are protected',
                    'Rest periods are legally mandated'
                ]
            },
            fi: {
                introduction: 'Suomen työlainsäädäntö säätelee tiukasti työaikoja ja lomaoikeuksia työntekijöiden hyvinvoinnin ja työn ja vapaa-ajan tasapainon varmistamiseksi.',
                sections: [
                    {
                        title: 'Säännöllinen Työaika',
                        content: 'Normaali työaika on 8 tuntia päivässä ja 40 tuntia viikossa. Monilla työpaikoilla on kuitenkin joustavia järjestelyjä. Työaikoja säätelevät usein työehtosopimukset, jotka voivat tarjota parempia ehtoja kuin lakisääteiset vähimmäisvaatimukset.'
                    },
                    {
                        title: 'Ylityö',
                        content: 'Ylityö on korvattava joko korotetulla palkalla tai vapaalla. Ensimmäiset 8 ylityötuntia viikossa korvataan 150 %:lla ja sen ylittävät tunnit 200 %:lla. Ylityö ei ole pakollista ja siitä tulee sopia.'
                    },
                    {
                        title: 'Vuosiloma',
                        content: 'Työntekijät ansaitsevat 2 lomapäivää kuukaudessa ensimmäisen vuoden aikana ja 2,5 päivää kuukaudessa vuoden työsuhteen jälkeen. Tämä vastaa 24-30 päivän palkallista lomaa vuodessa. Lomakorvaus on tyypillisesti 1,5 kertaa tavallinen palkka.'
                    },
                    {
                        title: 'Yleiset Vapaapäivät',
                        content: 'Suomessa on useita yleisiä vapaapäiviä, mukaan lukien uudenvuodenpäivä, loppiainen, pitkäperjantai, pääsiäinen, vappu, juhannus, itsenäisyyspäivä ja joulu. Työ yleisinä vapaapäivinä korvataan kaksinkertaisella palkalla tai vapaalla.'
                    },
                    {
                        title: 'Tauot ja Lepoajat',
                        content: 'Työntekijöillä on oikeus taukoihin työpäivän aikana. 6 tunnin työskentelyn jälkeen vaaditaan vähintään 30 minuutin tauko. Vuorokautisen lepoajan on oltava vähintään 11 peräkkäistä tuntia ja viikoittaisen levon vähintään 35 tuntia.'
                    }
                ],
                keyPoints: [
                    'Normaali työviikko on 40 tuntia',
                    'Ylityö vaatii korvauksen',
                    'Vuosiloma on 24-30 päivää',
                    'Yleiset vapaapäivät ovat suojattuja',
                    'Lepoajat ovat lakisääteisiä'
                ]
            }
        }
    }
];
