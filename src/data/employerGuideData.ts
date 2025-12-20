export interface EmployerGuideSection {
    id: string;
    title: {
        en: string;
        fi: string;
    };
    icon: string;
    category: 'eu' | 'non-eu' | 'general';
    content: {
        en: {
            introduction: string;
            steps: {
                title: string;
                description: string;
            }[];
            requirements: string[];
            officialLinks: {
                title: string;
                url: string;
                description: string;
            }[];
            keyPoints: string[];
        };
        fi: {
            introduction: string;
            steps: {
                title: string;
                description: string;
            }[];
            requirements: string[];
            officialLinks: {
                title: string;
                url: string;
                description: string;
            }[];
            keyPoints: string[];
        };
    };
}

export const employerGuideData: EmployerGuideSection[] = [
    {
        id: 'eu-workers',
        title: {
            en: 'Hiring EU/EEA Citizens',
            fi: 'EU/ETA-kansalaisten Palkkaaminen'
        },
        icon: 'Users',
        category: 'eu',
        content: {
            en: {
                introduction: 'EU/EEA citizens have the right to work in Finland without a work permit. However, there are still important registration and reporting requirements for employers.',
                steps: [
                    {
                        title: 'Verify Right to Work',
                        description: 'EU/EEA citizens can start work immediately. They should register with the Finnish Immigration Service if staying longer than 3 months.'
                    },
                    {
                        title: 'Employment Contract',
                        description: 'Provide a written employment contract in a language the employee understands. Include all mandatory terms as per Finnish Employment Contracts Act.'
                    },
                    {
                        title: 'Register with Tax Administration',
                        description: 'Report the employee to the Tax Administration and ensure they have a Finnish tax number (verotunniste).'
                    },
                    {
                        title: 'Social Security Registration',
                        description: 'Register the employee with the Finnish social security system (Kela) if they will be working in Finland for an extended period.'
                    },
                    {
                        title: 'A1 Certificate (if applicable)',
                        description: 'If the employee is posted from another EU country, ensure they have an A1 certificate proving their social security coverage.'
                    }
                ],
                requirements: [
                    'Valid passport or ID card from EU/EEA country',
                    'Written employment contract',
                    'Tax number registration',
                    'Social security registration (if applicable)',
                    'A1 certificate (for posted workers)'
                ],
                officialLinks: [
                    {
                        title: 'Finnish Immigration Service - EU Citizens',
                        url: 'https://migri.fi/en/eu-citizens',
                        description: 'Official information about EU citizens\' rights and registration requirements'
                    },
                    {
                        title: 'Finnish Tax Administration',
                        url: 'https://www.vero.fi/en/businesses-and-corporations/about-corporate-taxes/employer/',
                        description: 'Employer obligations and tax registration'
                    },
                    {
                        title: 'Kela - Social Security',
                        url: 'https://www.kela.fi/web/en/from-eu-or-efta-country-to-finland',
                        description: 'Social security coverage for EU workers'
                    },
                    {
                        title: 'TE Services - Employment',
                        url: 'https://www.te-palvelut.fi/en/employers',
                        description: 'Employment services and support for employers'
                    }
                ],
                keyPoints: [
                    'No work permit needed for EU/EEA citizens',
                    'Registration required if staying over 3 months',
                    'Same employment rights as Finnish workers',
                    'Employer must ensure proper tax and social security registration',
                    'A1 certificate required for posted workers'
                ]
            },
            fi: {
                introduction: 'EU/ETA-kansalaisilla on oikeus työskennellä Suomessa ilman työlu­paa. Työnantajilla on kuitenkin tärkeitä ilmoitus- ja rekisteröintivelvoitteita.',
                steps: [
                    {
                        title: 'Tarkista Työnteko-oikeus',
                        description: 'EU/ETA-kansalaiset voivat aloittaa työskentelyn välittömästi. Heidän tulee rekisteröityä Maahanmuuttovirastoon, jos oleskelevat yli 3 kuukautta.'
                    },
                    {
                        title: 'Työsopimus',
                        description: 'Laadi kirjallinen työsopimus työntekijän ymmärtämällä kielellä. Sisällytä kaikki pakolliset ehdot työsopimuslain mukaisesti.'
                    },
                    {
                        title: 'Rekisteröinti Verohallintoon',
                        description: 'Ilmoita työntekijä Verohallinnolle ja varmista, että hänellä on suomalainen verotunniste.'
                    },
                    {
                        title: 'Sosiaaliturvan Rekisteröinti',
                        description: 'Rekisteröi työntekijä Suomen sosiaaliturvajärjestelmään (Kela), jos hän työskentelee Suomessa pidemmän aikaa.'
                    },
                    {
                        title: 'A1-todistus (tarvittaessa)',
                        description: 'Jos työntekijä on lähetetty toisesta EU-maasta, varmista, että hänellä on A1-todistus sosiaaliturvan kattavuudesta.'
                    }
                ],
                requirements: [
                    'Voimassa oleva passi tai henkilökortti EU/ETA-maasta',
                    'Kirjallinen työsopimus',
                    'Verotunnisteen rekisteröinti',
                    'Sosiaaliturvan rekisteröinti (tarvittaessa)',
                    'A1-todistus (lähetetyille työntekijöille)'
                ],
                officialLinks: [
                    {
                        title: 'Maahanmuuttovirasto - EU-kansalaiset',
                        url: 'https://migri.fi/eu-kansalainen',
                        description: 'Virallinen tieto EU-kansalaisten oikeuksista ja rekisteröintivaatimuksista'
                    },
                    {
                        title: 'Verohallinto',
                        url: 'https://www.vero.fi/yritykset-ja-yhteisot/tietoa-yritysverotuksesta/tyonantajat/',
                        description: 'Työnantajan velvollisuudet ja verorekisteröinti'
                    },
                    {
                        title: 'Kela - Sosiaaliturva',
                        url: 'https://www.kela.fi/eu-tai-eta-maasta-suomeen',
                        description: 'EU-työntekijöiden sosiaaliturva'
                    },
                    {
                        title: 'TE-palvelut - Työllistäminen',
                        url: 'https://www.te-palvelut.fi/tyonantajat',
                        description: 'Työvoimapalvelut ja tuki työnantajille'
                    }
                ],
                keyPoints: [
                    'EU/ETA-kansalaiset eivät tarvitse työlupaa',
                    'Rekisteröinti vaaditaan yli 3 kuukauden oleskeluun',
                    'Samat työntekijänoikeudet kuin suomalaisilla',
                    'Työnantajan on varmistettava asianmukainen vero- ja sosiaaliturvarekisteröinti',
                    'A1-todistus vaaditaan lähetetyille työntekijöille'
                ]
            }
        }
    },
    {
        id: 'non-eu-workers',
        title: {
            en: 'Hiring Non-EU Citizens',
            fi: 'EU:n Ulkopuolisten Kansalaisten Palkkaaminen'
        },
        icon: 'Globe',
        category: 'non-eu',
        content: {
            en: {
                introduction: 'Hiring workers from outside the EU/EEA requires a residence permit for work. The employer plays a crucial role in the application process and has specific obligations.',
                steps: [
                    {
                        title: 'Job Advertisement',
                        description: 'Advertise the position through TE Services for at least 2 weeks before hiring from outside EU/EEA (unless exempt).'
                    },
                    {
                        title: 'Employment Contract',
                        description: 'Prepare a detailed employment contract meeting Finnish standards. Include salary, working hours, and all terms clearly.'
                    },
                    {
                        title: 'Employer Statement',
                        description: 'Provide an employer statement (työnantajan selvitys) to support the residence permit application. This confirms the job offer and working conditions.'
                    },
                    {
                        title: 'Residence Permit Application',
                        description: 'The employee applies for a residence permit for work. Processing time is typically 3-6 months.'
                    },
                    {
                        title: 'Work Can Begin',
                        description: 'The employee can start work only after receiving the residence permit, unless they have a positive decision allowing them to start earlier.'
                    },
                    {
                        title: 'Register with Authorities',
                        description: 'Register the employee with Tax Administration, social security, and report to occupational health services.'
                    }
                ],
                requirements: [
                    'Valid job offer meeting Finnish salary and working condition standards',
                    'Employment contract in writing',
                    'Employer statement for residence permit',
                    'Job advertisement through TE Services (unless exempt)',
                    'Proof of employee\'s qualifications',
                    'Residence permit for the employee'
                ],
                officialLinks: [
                    {
                        title: 'Finnish Immigration Service - Work in Finland',
                        url: 'https://migri.fi/en/work-in-finland',
                        description: 'Complete guide for employers hiring non-EU workers'
                    },
                    {
                        title: 'TE Services - Recruiting from Abroad',
                        url: 'https://www.te-palvelut.fi/en/employers/recruiting-from-abroad',
                        description: 'Official recruitment procedures and requirements'
                    },
                    {
                        title: 'Work in Finland - Employer Guide',
                        url: 'https://www.workinfinland.com/employers/',
                        description: 'Comprehensive employer resources and guides'
                    },
                    {
                        title: 'Finnish Tax Administration - Foreign Employees',
                        url: 'https://www.vero.fi/en/businesses-and-corporations/about-corporate-taxes/employer/foreign_employees/',
                        description: 'Tax obligations for foreign employees'
                    },
                    {
                        title: 'Occupational Safety and Health Administration',
                        url: 'https://www.tyosuojelu.fi/web/en/',
                        description: 'Workplace safety requirements'
                    }
                ],
                keyPoints: [
                    'Residence permit required before starting work',
                    'Job must meet Finnish salary and condition standards',
                    'Employer statement is mandatory for permit application',
                    'Processing time is 3-6 months',
                    'TE Services notification usually required',
                    'Same employment rights as Finnish workers once permit is granted'
                ]
            },
            fi: {
                introduction: 'EU/ETA:n ulkopuolisten työntekijöiden palkkaaminen edellyttää oleskelulupaa työn perusteella. Työnantajalla on keskeinen rooli hakemusprosessissa ja erityisiä velvollisuuksia.',
                steps: [
                    {
                        title: 'Työpaikan Ilmoittaminen',
                        description: 'Ilmoita työpaikka TE-palveluihin vähintään 2 viikoksi ennen EU/ETA:n ulkopuolelta palkkaamista (ellei vapautettu).'
                    },
                    {
                        title: 'Työsopimus',
                        description: 'Laadi yksityiskohtainen työsopimus suomalaisten standardien mukaisesti. Sisällytä palkka, työajat ja kaikki ehdot selkeästi.'
                    },
                    {
                        title: 'Työnantajan Selvitys',
                        description: 'Toimita työnantajan selvitys oleskeluluvan hakemuksen tueksi. Tämä vahvistaa työtarjouksen ja työolot.'
                    },
                    {
                        title: 'Oleskelulupahakemus',
                        description: 'Työntekijä hakee oleskelulupaa työn perusteella. Käsittelyaika on tyypillisesti 3-6 kuukautta.'
                    },
                    {
                        title: 'Työn Aloitus',
                        description: 'Työntekijä voi aloittaa työskentelyn vasta oleskeluluvan saatuaan, ellei hänellä ole myönteistä päätöstä, joka sallii aikaisemman aloituksen.'
                    },
                    {
                        title: 'Rekisteröinti Viranomaisille',
                        description: 'Rekisteröi työntekijä Verohallintoon, sosiaaliturvaan ja ilmoita työterveyshuoltoon.'
                    }
                ],
                requirements: [
                    'Voimassa oleva työtarjous suomalaisten palkka- ja työehtostandardien mukaisesti',
                    'Kirjallinen työsopimus',
                    'Työnantajan selvitys oleskelulupaa varten',
                    'Työpaikan ilmoitus TE-palveluihin (ellei vapautettu)',
                    'Todistus työntekijän pätevyydestä',
                    'Työntekijän oleskelulupa'
                ],
                officialLinks: [
                    {
                        title: 'Maahanmuuttovirasto - Työnteko Suomessa',
                        url: 'https://migri.fi/tyonteko-suomessa',
                        description: 'Täydellinen opas työnantajille EU:n ulkopuolisten työntekijöiden palkkaamiseen'
                    },
                    {
                        title: 'TE-palvelut - Rekrytointi Ulkomailta',
                        url: 'https://www.te-palvelut.fi/tyonantajat/rekrytointi-ulkomailta',
                        description: 'Viralliset rekrytointimenettelyt ja vaatimukset'
                    },
                    {
                        title: 'Work in Finland - Työnantajan Opas',
                        url: 'https://www.workinfinland.com/fi/tyonantajat/',
                        description: 'Kattavat työnantajaresurssit ja oppaat'
                    },
                    {
                        title: 'Verohallinto - Ulkomaiset Työntekijät',
                        url: 'https://www.vero.fi/yritykset-ja-yhteisot/tietoa-yritysverotuksesta/tyonantajat/ulkomaiset_tyontekijat/',
                        description: 'Verovelvollisuudet ulkomaisille työntekijöille'
                    },
                    {
                        title: 'Työsuojeluhallinto',
                        url: 'https://www.tyosuojelu.fi/',
                        description: 'Työturvallisuusvaatimukset'
                    }
                ],
                keyPoints: [
                    'Oleskelulupa vaaditaan ennen työn aloittamista',
                    'Työn on täytettävä suomalaiset palkka- ja ehtostandardit',
                    'Työnantajan selvitys on pakollinen lupahakemuksessa',
                    'Käsittelyaika on 3-6 kuukautta',
                    'TE-palveluiden ilmoitus yleensä vaaditaan',
                    'Samat työntekijänoikeudet kuin suomalaisilla luvan saatuaan'
                ]
            }
        }
    },
    {
        id: 'employer-obligations',
        title: {
            en: 'General Employer Obligations',
            fi: 'Yleiset Työnantajavelvollisuudet'
        },
        icon: 'FileCheck',
        category: 'general',
        content: {
            en: {
                introduction: 'All employers in Finland must comply with Finnish labor law regardless of the employee\'s nationality. Here are the key obligations when employing foreign workers.',
                steps: [
                    {
                        title: 'Collective Agreements',
                        description: 'Apply the relevant collective agreement or ensure salary and conditions meet generally applicable standards in the field.'
                    },
                    {
                        title: 'Working Hours',
                        description: 'Follow the Working Hours Act. Regular working time is max 8 hours/day and 40 hours/week. Overtime must be compensated properly.'
                    },
                    {
                        title: 'Annual Leave',
                        description: 'Provide annual leave according to the Annual Holidays Act (minimum 2-2.5 days per month worked).'
                    },
                    {
                        title: 'Occupational Health Care',
                        description: 'Arrange occupational health care services for all employees, including preventive health care.'
                    },
                    {
                        title: 'Insurance',
                        description: 'Ensure proper insurance coverage including workers\' compensation insurance and pension insurance.'
                    },
                    {
                        title: 'Language Requirements',
                        description: 'Provide employment contract and essential workplace information in a language the employee understands.'
                    }
                ],
                requirements: [
                    'Written employment contract',
                    'Compliance with collective agreements or general standards',
                    'Proper working hours and overtime compensation',
                    'Annual leave entitlement',
                    'Occupational health care arrangement',
                    'Workers\' compensation insurance',
                    'Pension insurance',
                    'Information in understandable language'
                ],
                officialLinks: [
                    {
                        title: 'Ministry of Economic Affairs and Employment',
                        url: 'https://tem.fi/en/employment',
                        description: 'Employment legislation and employer responsibilities'
                    },
                    {
                        title: 'Finnish Centre for Pensions',
                        url: 'https://www.etk.fi/en/',
                        description: 'Pension insurance requirements'
                    },
                    {
                        title: 'Workers\' Compensation Center',
                        url: 'https://www.tvk.fi/en/',
                        description: 'Workers\' compensation insurance information'
                    },
                    {
                        title: 'Regional State Administrative Agencies',
                        url: 'https://avi.fi/en/',
                        description: 'Occupational safety and health supervision'
                    },
                    {
                        title: 'InfoFinland - Employer',
                        url: 'https://www.infofinland.fi/en/work/employer',
                        description: 'Comprehensive employer guide'
                    }
                ],
                keyPoints: [
                    'Same obligations for all employees regardless of nationality',
                    'Collective agreements or general standards must be followed',
                    'Occupational health care is mandatory',
                    'Proper insurance coverage required',
                    'Information must be provided in understandable language',
                    'Regular inspections by authorities possible'
                ]
            },
            fi: {
                introduction: 'Kaikkien Suomessa toimivien työnantajien on noudatettava Suomen työlainsäädäntöä työntekijän kansallisuudesta riippumatta. Tässä keskeiset velvollisuudet ulkomaalaisia työntekijöitä palkattaessa.',
                steps: [
                    {
                        title: 'Työehtosopimukset',
                        description: 'Sovella asiaankuuluvaa työehtosopimusta tai varmista, että palkka ja ehdot vastaavat alan yleisesti noudatettavia ehtoja.'
                    },
                    {
                        title: 'Työajat',
                        description: 'Noudata työaikalakia. Säännöllinen työaika on enintään 8 tuntia/päivä ja 40 tuntia/viikko. Ylityöt on korvattava asianmukaisesti.'
                    },
                    {
                        title: 'Vuosiloma',
                        description: 'Myönnä vuosilomaa vuosilomalain mukaisesti (vähintään 2-2,5 päivää työskentelykuukautta kohden).'
                    },
                    {
                        title: 'Työterveyshuolto',
                        description: 'Järjestä työterveyshuoltopalvelut kaikille työntekijöille, mukaan lukien ennaltaehkäisevä terveydenhuolto.'
                    },
                    {
                        title: 'Vakuutukset',
                        description: 'Varmista asianmukainen vakuutusturva, mukaan lukien tapaturmavakuutus ja eläkevakuutus.'
                    },
                    {
                        title: 'Kielivaatimukset',
                        description: 'Toimita työsopimus ja olennaiset työpaikkaa koskevat tiedot työntekijän ymmärtämällä kielellä.'
                    }
                ],
                requirements: [
                    'Kirjallinen työsopimus',
                    'Työehtosopimusten tai yleisten ehtojen noudattaminen',
                    'Asianmukaiset työajat ja ylityökorvaukset',
                    'Vuosilomaoikeus',
                    'Työterveyshuollon järjestäminen',
                    'Tapaturmavakuutus',
                    'Eläkevakuutus',
                    'Tiedot ymmärrettävällä kielellä'
                ],
                officialLinks: [
                    {
                        title: 'Työ- ja elinkeinoministeriö',
                        url: 'https://tem.fi/tyollisyys',
                        description: 'Työlainsäädäntö ja työnantajan vastuut'
                    },
                    {
                        title: 'Eläketurvakeskus',
                        url: 'https://www.etk.fi/',
                        description: 'Eläkevakuutusvaatimukset'
                    },
                    {
                        title: 'Tapaturmavakuutuskeskus',
                        url: 'https://www.tvk.fi/',
                        description: 'Tapaturmavakuutustiedot'
                    },
                    {
                        title: 'Aluehallintovirastot',
                        url: 'https://avi.fi/',
                        description: 'Työsuojelun valvonta'
                    },
                    {
                        title: 'InfoFinland - Työnantaja',
                        url: 'https://www.infofinland.fi/fi/tyo/tyonantaja',
                        description: 'Kattava työnantajan opas'
                    }
                ],
                keyPoints: [
                    'Samat velvollisuudet kaikille työntekijöille kansallisuudesta riippumatta',
                    'Työehtosopimuksia tai yleisiä ehtoja on noudatettava',
                    'Työterveyshuolto on pakollista',
                    'Asianmukainen vakuutusturva vaaditaan',
                    'Tiedot on annettava ymmärrettävällä kielellä',
                    'Viranomaisten säännölliset tarkastukset mahdollisia'
                ]
            }
        }
    },
    {
        id: 'posted-workers',
        title: {
            en: 'Posted Workers from Abroad',
            fi: 'Ulkomailta Lähetetyt Työntekijät'
        },
        icon: 'Plane',
        category: 'general',
        content: {
            en: {
                introduction: 'If you are posting workers to Finland from another country, or hiring a foreign company that posts workers to Finland, there are specific notification and compliance requirements.',
                steps: [
                    {
                        title: 'Notification Obligation',
                        description: 'Submit a notification to the Occupational Safety and Health Administration before work begins in Finland.'
                    },
                    {
                        title: 'A1 Certificate',
                        description: 'Ensure posted workers have an A1 certificate proving their social security coverage in their home country.'
                    },
                    {
                        title: 'Terms and Conditions',
                        description: 'Posted workers must receive at least the minimum terms and conditions of employment applicable in Finland.'
                    },
                    {
                        title: 'Representative in Finland',
                        description: 'Foreign employers must appoint a representative in Finland who can provide information to authorities.'
                    },
                    {
                        title: 'Document Retention',
                        description: 'Keep employment contracts, payslips, and working time records available for inspection in Finland.'
                    }
                ],
                requirements: [
                    'Notification to OSH Administration',
                    'A1 certificate for each posted worker',
                    'Compliance with Finnish minimum terms',
                    'Representative in Finland',
                    'Documents available in Finnish or Swedish',
                    'Proper insurance coverage'
                ],
                officialLinks: [
                    {
                        title: 'OSH Administration - Posted Workers',
                        url: 'https://www.tyosuojelu.fi/web/en/employment-relationship/posted-workers',
                        description: 'Official notification system and requirements'
                    },
                    {
                        title: 'Notification System for Posted Workers',
                        url: 'https://www.tyosuojelu.fi/web/en/employment-relationship/posted-workers/notification',
                        description: 'Online notification portal'
                    },
                    {
                        title: 'Finnish Tax Administration - Posted Workers',
                        url: 'https://www.vero.fi/en/businesses-and-corporations/about-corporate-taxes/employer/posted_workers/',
                        description: 'Tax obligations for posted workers'
                    },
                    {
                        title: 'Ministry of Economic Affairs - Posted Workers',
                        url: 'https://tem.fi/en/posted-workers',
                        description: 'Legislation and employer guide'
                    }
                ],
                keyPoints: [
                    'Notification required before work begins',
                    'A1 certificate mandatory for EU/EEA workers',
                    'Finnish minimum terms must be applied',
                    'Representative in Finland required',
                    'Documents must be available for inspection',
                    'Violations can result in fines and work bans'
                ]
            },
            fi: {
                introduction: 'Jos lähetät työntekijöitä Suomeen toisesta maasta tai palkkaat ulkomaisen yrityksen, joka lähettää työntekijöitä Suomeen, on noudatettava erityisiä ilmoitus- ja vaatimustenmukaisuusvaatimuksia.',
                steps: [
                    {
                        title: 'Ilmoitusvelvollisuus',
                        description: 'Tee ilmoitus Työsuojeluhallintoon ennen työn aloittamista Suomessa.'
                    },
                    {
                        title: 'A1-todistus',
                        description: 'Varmista, että lähetetyillä työntekijöillä on A1-todistus, joka todistaa heidän sosiaaliturvaansa kotimaassaan.'
                    },
                    {
                        title: 'Työehdot',
                        description: 'Lähetetyille työntekijöille on maksettava vähintään Suomessa sovellettavat vähimmäistyöehdot.'
                    },
                    {
                        title: 'Edustaja Suomessa',
                        description: 'Ulkomaisten työnantajien on nimettävä edustaja Suomeen, joka voi antaa tietoja viranomaisille.'
                    },
                    {
                        title: 'Asiakirjojen Säilytys',
                        description: 'Pidä työsopimukset, palkkalaskelmat ja työaikakirjanpito saatavilla tarkastusta varten Suomessa.'
                    }
                ],
                requirements: [
                    'Ilmoitus Työsuojeluhallintoon',
                    'A1-todistus jokaiselle lähetetylle työntekijälle',
                    'Suomen vähimmäisehtojen noudattaminen',
                    'Edustaja Suomessa',
                    'Asiakirjat saatavilla suomeksi tai ruotsiksi',
                    'Asianmukainen vakuutusturva'
                ],
                officialLinks: [
                    {
                        title: 'Työsuojeluhallinto - Lähetetyt Työntekijät',
                        url: 'https://www.tyosuojelu.fi/tyosuhde/lahetetyt-tyontekijat',
                        description: 'Virallinen ilmoitusjärjestelmä ja vaatimukset'
                    },
                    {
                        title: 'Ilmoitusjärjestelmä Lähetetyille Työntekijöille',
                        url: 'https://www.tyosuojelu.fi/tyosuhde/lahetetyt-tyontekijat/ilmoitus',
                        description: 'Online-ilmoitusportaali'
                    },
                    {
                        title: 'Verohallinto - Lähetetyt Työntekijät',
                        url: 'https://www.vero.fi/yritykset-ja-yhteisot/tietoa-yritysverotuksesta/tyonantajat/lahetetyt_tyontekijat/',
                        description: 'Lähetettyjen työntekijöiden verovelvollisuudet'
                    },
                    {
                        title: 'Työ- ja elinkeinoministeriö - Lähetetyt Työntekijät',
                        url: 'https://tem.fi/lahetetyt-tyontekijat',
                        description: 'Lainsäädäntö ja työnantajan opas'
                    }
                ],
                keyPoints: [
                    'Ilmoitus vaaditaan ennen työn aloittamista',
                    'A1-todistus pakollinen EU/ETA-työntekijöille',
                    'Suomen vähimmäisehtoja on sovellettava',
                    'Edustaja Suomessa vaaditaan',
                    'Asiakirjat on oltava saatavilla tarkastusta varten',
                    'Rikkomukset voivat johtaa sakkoihin ja työkieltoihin'
                ]
            }
        }
    }
];
