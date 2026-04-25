import { env } from "../../config/env";

type InseeAddress = {
  numeroVoieEtablissement?: string;
  typeVoieEtablissement?: string;
  libelleVoieEtablissement?: string;
  complementAdresseEtablissement?: string;
  codePostalEtablissement?: string;
  libelleCommuneEtablissement?: string;
};

type InseeLegalUnit = {
  denominationUniteLegale?: string;
  activitePrincipaleUniteLegale?: string;
  categorieJuridiqueUniteLegale?: string;
  trancheEffectifsUniteLegale?: string;
};

type InseeEstablishment = {
  siren?: string;
  trancheEffectifsEtablissement?: string;
  etablissementSiege?: boolean;
  uniteLegale?: InseeLegalUnit;
  adresseEtablissement?: InseeAddress;
};

type InseeSiretResponse = {
  etablissement?: InseeEstablishment;
}

export type SiretInfo = {
  siret: string;
  siren: string | null;
  trancheEffectifsUniteLegale: string;
  trancheEffectifsEtablissement: string;
  codePostal: string | null;
  ville: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  raisonSociale: string | null;
  codeNaf: string | null;
  categorieJuridiqueCode: string | null;
  etablissementSiege: "PRIMARY" | "SECONDARY" | "UNKNOWN";
};


function isKnownValue(value: string | undefined) {
  return Boolean(value && value !== "[ND]");
}

export async function getInfoSiret(siret: string): Promise<SiretInfo | null> {
  if (!env.API_SIREN_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.insee.fr/api-sirene/3.11/siret/${siret}?masquerValeursNulles=true`,
      {
        headers: {
          "X-INSEE-Api-Key-Integration": env.API_SIREN_KEY,
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as InseeSiretResponse | null;

    if (!data) {
      return null;
    }
    console.log(data);
    const establishment = data.etablissement;
    const address = establishment?.adresseEtablissement;
    const addressParts: string[] = [];

    let raisonSociale: string | null = null;
    let siren: string | null = establishment?.siren ?? null;
    let codeNaf: string | null = null;
    let categorieJuridiqueCode: string | null = null;
    let trancheEffectifsUniteLegale = "NN";
    let trancheEffectifsEtablissement =
      establishment?.trancheEffectifsEtablissement || "NN";
    let etablissementSiege: "PRIMARY" | "SECONDARY" | "UNKNOWN" = "UNKNOWN";
    if (establishment?.etablissementSiege !== undefined)
      etablissementSiege = establishment?.etablissementSiege === false ? "SECONDARY" : "PRIMARY";

    if (establishment?.uniteLegale) {
      const legalUnit = establishment.uniteLegale;

      if (isKnownValue(legalUnit.denominationUniteLegale)) {
        raisonSociale = legalUnit.denominationUniteLegale ?? null;
      }

      if (isKnownValue(legalUnit.activitePrincipaleUniteLegale)) {
        codeNaf = legalUnit.activitePrincipaleUniteLegale ?? null;
      }

      if (isKnownValue(legalUnit.categorieJuridiqueUniteLegale)) {
        categorieJuridiqueCode = legalUnit.categorieJuridiqueUniteLegale ?? null;
      }

      if (isKnownValue(legalUnit.trancheEffectifsUniteLegale)) {
        trancheEffectifsUniteLegale = legalUnit.trancheEffectifsUniteLegale ?? "NN";
      }
    }


    if (address) {
      console.log(address);
      if (isKnownValue(address.numeroVoieEtablissement)) {
        addressParts.push(address.numeroVoieEtablissement!);
      }

      if (isKnownValue(address.typeVoieEtablissement)) {
        addressParts.push(address.typeVoieEtablissement!);
      }

      if (isKnownValue(address.libelleVoieEtablissement)) {
        addressParts.push(address.libelleVoieEtablissement!);
      }
    }

    const res = {
      siret,
      siren,
      trancheEffectifsUniteLegale,
      trancheEffectifsEtablissement,
      codePostal: isKnownValue(address?.codePostalEtablissement)
        ? address?.codePostalEtablissement ?? null
        : null,
      ville: isKnownValue(address?.libelleCommuneEtablissement)
        ? address?.libelleCommuneEtablissement ?? null
        : null,
      addressLine1: addressParts.length > 0 ? addressParts.join(" ") : null,
      addressLine2: isKnownValue(address?.complementAdresseEtablissement)
        ? address?.complementAdresseEtablissement ?? null
        : null,
      raisonSociale,
      codeNaf,
      categorieJuridiqueCode,
      etablissementSiege,
    };
    console.log(res);
    return res;
  } catch {
    return null;
  }
}
