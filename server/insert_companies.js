// Save this as insert_companies.js and run with: node insert_companies.js

import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function main() {
  const db = await open({
    filename: "./server/db/database.sqlite", // <-- Correct path
    driver: sqlite3.Database,
  });

  const companies = [
    ["ALLIANZ DIRECT SOCIETÀ PER AZIONI","ALLIANZ","D","","65977989","MILANO","","https://www.allianzdirect.it/"],
    ["ALLIANZ NEXT S.P.A.","ALLIANZ","D","","45684400","MILANO","","https://www.allianzviva.it/"],
    ["ALLIANZ SOCIETA' PER AZIONI","ALLIANZ","M","","403000000","MILANO","","https://www.allianz.it/"],
    ["UNICREDIT ALLIANZ ASSICURAZIONI S.P.A.","ALLIANZ/UNICREDIT","D","","52000000","MILANO","","https://www.unicreditallianzassicurazioni.it/"],
    ["UNICREDIT ALLIANZ VITA S.P.A.","ALLIANZ/UNICREDIT","V","","102000000","MILANO","","https://www.unicreditallianzvita.it/"],
    ["AMTRUST ASSICURAZIONI S.P.A.","AMTRUST","D","","5500000","MILANO","","https://www.amtrust.it/"],
    ["ASSICURAZIONI RISCHI AGRICOLI VMG 1857 S.P.A.","ARA","D","","7000000","MILANO","","https://www.ara1857.it/"],
    ["ARGOGLOBAL ASSICURAZIONI S.P.A.","ARGO","D","","24500000","ROMA","","https://www.argolimited.com/international/argoglobal-assicurazioni/"],
    ["ATHORA ITALIA S.P.A.","ATHORA","V","","50431778","GENOVA","","https://www.athora.it/"],
    ["AXA ASSICURAZIONI S.P.A.","AXA","M","","232535335","MILANO","","https://www.axa.it/"],
    ["AXA MPS ASSICURAZIONI DANNI SOCIETA' PER AZIONI","AXA","D","","39000000","ROMA","","https://www.axa-mps.it/"],
    ["AXA MPS ASSICURAZIONI VITA SOCIETA' PER AZIONI","AXA","V","","569000000","ROMA","","https://www.axa-mps.it/"],
    ["NOBIS COMPAGNIA DI ASSICURAZIONI S.P.A.","AXA","D","","37890907","BORGARO TORINESE","Roberto Rossi, Head of IT (https://www.linkedin.com/in/roberto-rossi-2392472/)","https://www.nobis.it/"],
    ["NOBIS VITA S.P.A.","AXA","V","","33704000","AGRATE BRIANZA","","https://www.nobisvita.it/"],
    ["QUIXA ASSICURAZIONI S.P.A.","AXA","D","","107599728","MILANO","","https://www.quixa.it/"],
    ["MEDIOLANUM ASSICURAZIONI S.P.A.","BANCA MEDIOLANUM","D","","25800000","BASIGLIO","","https://www.mediolanumassicurazioni.it/"],
    ["MEDIOLANUM VITA S.P.A","BANCA MEDIOLANUM","V","","207720000","BASIGLIO","","https://www.mediolanumvita.it/"],
    ["BENE ASSICURAZIONI S.P.A. SOCIETÀ BENEFIT","BENE","D","","25199000","MILANO","Mirco Zardoni, Responsabile Piattaforma Digitale e Sistemi IT","https://www.bene.it/"],
    ["BNP PARIBAS CARDIF VITA COMPAGNIA DI ASSICURAZIONE E RIASSICURAZIONE S.P.A.","BNP","M","","195209975","MILANO","","https://bnpparibascardif.it/"],
    ["CF ASSICURAZIONI S.P.A. - COMPAGNIA DI ASSICURAZIONE PER IL CREDITO E LA FAMIGLIA","CF","D","","38255220","ROMA","","https://www.cfassicurazioni.com/"],
    ["CF LIFE COMPAGNIA DI ASSICURAZIONI VITA S.P.A.","CF","V","","38255220","ROMA","","https://www.cfassicurazioni.com/"],
    ["CNP UNICREDIT VITA S.P.A.","CNP","V","","","MILANO","","https://www.cnpvita.it/"],
    ["CNP VITA ASSICURA S.P.A.","CNP","V","","247000000","MILANO","Martina Sofia Santucci, Director Operations Management","https://gruppocnp.it/"],
    ["CREDEMASSICURAZIONI S.P.A.","CREDEM/REALE MUTUA","D","","14097120","REGGIO NELL'EMILIA","","https://www.credemassicurazioni.it/"],
    ["CREDEMVITA S.P.A.","CREDEM/REALE MUTUA","V","","221600070","REGGIO NELL'EMILIA","","https://www.credemvita.it/"],
    ["BANCO BPM ASSICURAZIONI S.P.A","CREDIT AGRICOLE","D","","22000000","MILANO","","https://www.bancobpmassicurazioni.it/"],
    ["BANCO BPM VITA S.P.A","CREDIT AGRICOLE","V","","179125000","MILANO","","https://www.bancobpmvita.it/"],
    ["CRÉDIT AGRICOLE ASSICURAZIONI S.P.A.","CREDIT AGRICOLE","D","","9500000","MILANO","","https://www.ca-assicurazioni.it/"],
    ["CRÉDIT AGRICOLE VITA S.P.A.","CREDIT AGRICOLE","V","","236350000","PARMA","","https://www.ca-vita.it/"],
    ["VERA ASSICURAZIONI S.P.A.","CREDIT AGRICOLE","D","","63500000","MILANO","","https://www.veraassicurazioni.it/"],
    ["VERA PROTEZIONE S.P.A.","CREDIT AGRICOLE","V","","47500000","MILANO","","https://www.veraassicurazioni.it/"],
    ["VERA VITA S.P.A.","CREDIT AGRICOLE","V","","219600005","MILANO","","https://www.veravitaassicurazioni.it/"],
    ["CRONOS VITA ASSICURAZIONI S.P.A.","CRONOS","V","","60000000","MILANO","","https://www.cronosvita.it/"],
    ["ASSIMOCO S.P.A. COMPAGNIA DI ASSICURAZIONI E RIASSICURAZIONI - MOVIMENTO COOPERATIVO","DZ","D","","190000000","MILANO","Mirella Maffei, Guido Gusella","https://www.assimoco.it/"],
    ["ASSIMOCO VITA S.P.A. COMPAGNIA DI ASSICURAZIONE SULLA VITA","DZ","V","","105000000","MILANO","Mirella Maffei, Guido Gusella","https://www.assimoco.it/"],
    ["BCC ASSICURAZIONI S.P.A.","DZ","D","","14448000","MILANO","","https://www.bccassicurazioni.com/"],
    ["BCC VITA S.P.A. COMPAGNIA DI ASSICURAZIONI VITA","DZ","V","","62000000","MILANO","","https://www.bccvita.it/"],
    ["ALLEANZA ASSICURAZIONI S.P.A.","GENERALI","M","","210000000","MILANO","","https://www.alleanza.it/"],
    ["ASSICURAZIONI GENERALI SOCIETA' PER AZIONI","GENERALI","M","","1602736602","TRIESTE","Massimo Natale, Head of Data & Platform Governance","https://www.generali.com/"],
    ["D.A.S. DIFESA AUTOMOBILISTICA SINISTRI - S.P.A. DI ASSICURAZIONE","GENERALI","D","","2750000","VERONA","","https://www.das.it/"],
    ["EUROP ASSISTANCE ITALIA S.P.A.","GENERALI","D","","12000000","ASSAGO","Irene Floretta, COO","https://www.europassistance.it/"],
    ["GENERALI ITALIA S.P.A.","GENERALI","M","","1618628450","MOGLIANO VENETO","Massimo Natale, Head of Data & Platform Governance","https://www.generali.it/"],
    ["GENERTEL S.P.A.","GENERALI","D","","145141520","TRIESTE","Massimo Natale, Head of Data & Platform Governance","https://www.genertel.it/"],
    ["GROUPAMA ASSICURAZIONI SOCIETA' PER AZIONI","GROUPAMA","M","","492827404","ROMA","","https://www.groupama.it/"],
    ["HDI ASSICURAZIONI S.P.A.","HDI","M","","351000000","ROMA","","https://www.hdiassicurazioni.it/"],
    ["HELVETIA ITALIA ASSICURAZIONI S.P.A.","HELVETIA","D","","15600000","MILANO","","https://www.helvetia.com/it/web/it/chi-siamo/helvetia/helvetia-in-italia/ le-compagnie-del-gruppo/helvetia-italia.html"],
    ["HELVETIA VITA COMPAGNIA ITALO-SVIZZERA DI ASSICURAZIONI SULLA VITA S.P.A.","HELVETIA","V","","47594000","MILANO","","https://www.helvetia.com/it/web/it/chi-siamo/helvetia/helvetia-in-italia/ le-compagnie-del-gruppo/helvetia-vita.html"],
    ["IMA ITALIA ASSISTANCE S.P.A.","IMA","V","","4285590","SESTO SAN GIOVANNI","","https://www.imaitalia.it/it/ https://www.imaway.it/"],
    ["SLP - ASSICURAZIONI SPESE LEGALI PERITALI E RISCHI ACCESSORI S.P.A.","INDIPENDENTE","D","","2508000","TORINO","","https://www.slpspa.it/"],
    ["TUTELA LEGALE S.P.A.","INDIPENDENTE","D","","2500000","MILANO","","https://www.tutelalegale.it/"],
    ["UCA - ASSICURAZIONE SPESE LEGALI E PERITALI S.P.A.","INDIPENDENTE","D","","6000000","TORINO","","https://www.ucaspa.com/"],
    ["FIDEURAM VITA S.P.A.","INTESA SANPAOLO","V","","357446836","ROMA","","https://www.fideuramvita.it/"],
    ["INTESA SANPAOLO ASSICURAZIONI S.P.A.","INTESA SANPAOLO","-","","320422508","TORINO","Franco Peduto, Chief Information Officer","https://www.intesasanpaoloassicurazioni.com/"],
    ["INTESA SANPAOLO PROTEZIONE S.P.A.","INTESA SANPAOLO","D","","27912258","TORINO","Franco Peduto, Chief Information Officer","https://www.intesasanpaoloprotezione.com/"],
    ["ITAS - ISTITUTO TRENTINO-ALTO ADIGE PER ASSICURAZIONI SOCIETA' MUTUA DI ASSICURAZIONI","ITAS","D","","81064962","TRENTO","","https://www.gruppoitas.it/"],
    ["ITAS VITA S.P.A.","ITAS","V","","81064962","TRENTO","","https://www.gruppoitas.it/homepage"],
    ["VERTI ASSICURAZIONI S.P.A.","MAPFRE","D","","205823000","COLOGNO MONZESE","","https://www.verti.it/"],
    ["ASSICURATRICE MILANESE SPA - COMPAGNIA DI ASSICURAZIONI","MODENA CAPITALE","D","","50000000","SAN CESARIO SUL PANARO","","https://www.assicuratricemilanese.it/"],
    ["NET INSURANCE LIFE S.P.A.","POSTE ITALIANE","V","","10415500","ROMA","Fabio Pittana, COO & Digital Platform","https://www.netinsurance.it/"],
    ["NET INSURANCE S.P.A.","POSTE ITALIANE","D","","10415500","ROMA","Fabio Pittana, COO & Digital Platform","https://www.netinsurance.it/"],
    ["POSTE ASSICURA S.P.A.","POSTE ITALIANE","D","","25000000","ROMA","","https://posteassicura.poste.it/"],
    ["POSTE VITA S.P.A.","POSTE ITALIANE","V","","1216607898","ROMA","","https://postevita.poste.it/"],
    ["S2C S.P.A. COMPAGNIA DI ASSICURAZIONI DI CREDITI E CAUZIONI","REAGIRA","D","","5500000","ROMA","","https://www.s2cspa.it"],
    ["COMPAGNIA ITALIANA DI PREVIDENZA, ASSICURAZIONI E RIASSICURAZIONI S.P.A.","REALE MUTUA","M","","57626000","MILANO","","https://www.italiana.it/"],
    ["SOCIETA' REALE MUTUA DI ASSICURAZIONI","REALE MUTUA","M","","60000","TORINO","Gian Franco Bono, Data Governance Specialist","https://www.realemutua.it/"],
    ["REVO INSURANCE S.P.A.","REVO","D","","6680000","VERONA","Matteo Merli, Deputy COO","https://www.revoinsurance.com/"],
    ["GLOBAL ASSISTANCE COMPAGNIA DI ASSICURAZIONI E RIASSICURAZIONI S.P.A.","RI FIN","D","","5000000","MILANO","Vincenzo Latorraca, CEO","https://globalassistance.it/"],
    ["SACE BT S.P.A.","SACE (MEF)","D","","56539356","ROMA","","https://www.sacebt.it/"],
    ["SARA ASSICURAZIONI S.P.A. ASSICURATRICE UFFICIALE DELL'AUTOMOBILE CLUB D'ITALIA","SARA","M","","54675000","ROMA","","https://www.sara.it/"],
    ["SARA VITA S.P.A.","SARA","V","","76000000","ROMA","","https://www.sara.it/"],
    ["ARCA ASSICURAZIONI S.P.A.","UNIPOL","D","","50762146","VERONA","","https://www.arcassicura.it/"],
    ["ARCA VITA S.P.A.","UNIPOL","V","","208279080","VERONA","","https://www.arcassicura.it/"],
    ["BIM VITA S.P.A.","UNIPOL","V","","11500000","TORINO","","https://www.bimvita.it/"],
    ["COMPAGNIA ASSICURATRICE LINEAR S.P.A.","UNIPOL","D","","19300000","BOLOGNA","","https://www.linear.it/"],
    ["SIAT SOCIETA' ITALIANA ASSICURAZIONI E RIASSICURAZIONI PER AZIONI","UNIPOL","D","","38000000","GENOVA","","https://www.siat-assicurazioni.com/"],
    ["UNIPOL ASSICURAZIONI S.P.A.","UNIPOL","M","","3365292408","BOLOGNA","","https://www.unipol.it/"],
    ["UNISALUTE S.P.A.","UNIPOL","D","","78028566","BOLOGNA","","https://www.unisalute.it/"],
    ["VHV ITALIA ASSICURAZIONI S.P.A.","VHV","D","","7000000","BELLUNO","","https://vhv.it/"],
    ["VITTORIA ASSICURAZIONI S.P.A.","VITTORIA","M","","67378924","MILANO","Francesco Tomasoni, Head of IT Business Architecture","https://www.vittoriaassicurazioni.com/"],
    ["ZURICH INVESTMENTS LIFE S.P.A.","ZURICH","V","","207925480","MILANO","","https://www.zurich.it/"]
  ];

  for (const [
    compagnia,
    settore,
    gruppo,
    ramo,
    capitale_sociale,
    sede,
    key_people,
    sito_web
  ] of companies) {
    try {
      await db.run(
        `INSERT OR IGNORE INTO companies (compagnia, settore, gruppo, ramo, capitale_sociale, sede, key_people, sito_web)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        compagnia,
        settore,
        gruppo,
        ramo,
        capitale_sociale,
        sede,
        key_people,
        sito_web
      );
      console.log(`Inserted: ${compagnia}`);
    } catch (err) {
      console.error(`Error inserting ${compagnia}:`, err.message);
    }
  }

  await db.close();
}

main();