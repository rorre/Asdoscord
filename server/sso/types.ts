interface BaseUserAttribute {
  ldap_cn: string;
  kd_org: string;
  peran_user: string;
  nama: string;
}

type UserAttribute = BaseUserAttribute &
  (
    | {
        npm: string;
      }
    | {
        nim: string;
      }
  );

interface ResponseUserData {
  user: string[];
  attributes: ({
    ldap_cn: string[];
    kd_org: string[];
    peran_user: string[];
    nama: string[];
  } & (
    | {
        npm: string[];
      }
    | {
        nim: string[];
      }
  ))[];
}

interface CASResponse {
  serviceResponse: {
    $: {
      "xmlns:cas": string;
    };
  } & (
    | {
        authenticationSuccess: ResponseUserData[];
      }
    | {
        authenticationFailure: {
          _: string;
          $: {
            code: string;
          };
        }[];
      }
  );
}

interface ProgramInformation {
  faculty: string;
  study_program: string;
  educational_program: string;
}

export { UserAttribute, ResponseUserData, CASResponse, ProgramInformation };
