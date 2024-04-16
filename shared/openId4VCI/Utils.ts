import {createSignature, encodeB64} from '../cryptoutil/cryptoUtil';
import jwtDecode from 'jwt-decode';
import jose from 'node-jose';
import {isIOS} from '../constants';
import pem2jwk from 'simple-pem2jwk';
import {displayType, issuerType} from '../../machines/issuersMachine';
import getAllConfigurations from '../commonprops/commonProps';
import {CredentialWrapper} from '../../types/VC/EsignetMosipVC/vc';
import {VCMetadata} from '../VCMetadata';
import i18next from 'i18next';

export const Protocols = {
  OpenId4VCI: 'OpenId4VCI',
  OTP: 'OTP',
};

export const Issuers_Key_Ref = 'OpenId4VCI_KeyPair';

export const getIdentifier = (context, credential) => {
  const credId = credential.credential.id.split('/');
  return (
    context.selectedIssuer.credential_issuer +
    ':' +
    context.selectedIssuer.protocol +
    ':' +
    credId[credId.length - 1]
  );
};

export const getBody = async context => {
  const proofJWT = await getJWT(context);
  return {
    format: 'ldp_vc',
    credential_definition: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'MOSIPVerifiableCredential'],
    },
    proof: {
      proof_type: 'jwt',
      jwt: proofJWT,
    },
  };
};

export const updateCredentialInformation = (context, credential) => {
  let credentialWrapper: CredentialWrapper = {};
  credentialWrapper.verifiableCredential = credential;
  credentialWrapper.identifier = getIdentifier(context, credential);
  credentialWrapper.generatedOn = new Date();
  credentialWrapper.verifiableCredential.issuerLogo =
    getDisplayObjectForCurrentLanguage(context.selectedIssuer.display)?.logo;
  return credentialWrapper;
};

export const getDisplayObjectForCurrentLanguage = (
  display: [displayType],
): displayType => {
  const currentLanguage = i18next.language;
  let displayType = display.filter(obj => obj.language == currentLanguage)[0];
  if (!displayType) {
    displayType = display.filter(obj => obj.language == 'en')[0];
  }
  return displayType;
};

export const getVCMetadata = context => {
  const [issuer, protocol, requestId] =
    context.credentialWrapper?.identifier.split(':');
  return VCMetadata.fromVC({
    requestId: requestId ? requestId : null,
    issuer: issuer,
    protocol: protocol,
    id: context.verifiableCredential?.credential.credentialSubject.UIN
      ? context.verifiableCredential?.credential.credentialSubject.UIN
      : context.verifiableCredential?.credential.credentialSubject.VID,
  });
};

export const constructAuthorizationConfiguration = (
  selectedIssuer: issuerType,
) => {
  /* selectedIssuer.client_id="DPG"
  selectedIssuer['.well-known']=selectedIssuer['.well-known'].replace("https://esignet.qa-inji.mosip.net/.well-known/","http://20.198.16.215/v1/esignet/.well-known/")
  selectedIssuer.credential_audience="http://localhost:8088/v1/esignet/oauth/v2/token"
  //selectedIssuer.authorization_audience="http://localhost:8088/v1/esignet/oauth/v2/token"
  selectedIssuer.credential_endpoint=selectedIssuer.credential_endpoint.replace("https://esignet.qa-inji.mosip.net","http://20.198.16.215")
  selectedIssuer.authorization_endpoint=selectedIssuer.credential_endpoint.replace("https://esignet.qa-inji.mosip.net","http://20.198.16.215")
  selectedIssuer.token_endpoint=selectedIssuer.credential_endpoint.replace("https://esignet.qa-inji.mosip.net","http://20.198.16.215")
  console.log("-----selectedIssuer------",selectedIssuer) */
  return {
    clientId: selectedIssuer.client_id,
    scopes: selectedIssuer.scopes_supported,
    additionalHeaders: selectedIssuer.additional_headers,
    wellKnownEndpoint: selectedIssuer['.well-known'],
    redirectUrl: selectedIssuer.redirect_uri,
    serviceConfiguration: {
      authorizationEndpoint: selectedIssuer.authorization_endpoint,
      tokenEndpoint: selectedIssuer.token_endpoint,
    },
  };
};

export const getJWK = async publicKey => {
  try {
    let publicKeyJWKString;
    let publicKeyJWK;
    if (isIOS()) {
      publicKeyJWKString = await jose.JWK.asKey(publicKey, 'pem');
      publicKeyJWK = publicKeyJWKString.toJSON();
    } else {
      publicKeyJWK = await pem2jwk(publicKey);
    }
    return {
      ...publicKeyJWK,
      alg: 'RS256',
      use: 'sig',
    };
  } catch (e) {
    console.log(
      'Exception occured while constructing JWK from PEM : ' +
        publicKey +
        '  Exception is ',
      e,
    );
  }
};
export const getJWT = async context => {
  try {
    const header64 = encodeB64(
      JSON.stringify({
        alg: 'RS256',
        jwk: await getJWK(context.publicKey),
        typ: 'openid4vci-proof+jwt',
      }),
    );
    const decodedToken = jwtDecode(context.tokenResponse.accessToken);
    const payload64 = encodeB64(
      JSON.stringify({
        iss: context.selectedIssuer.client_id,
        nonce: decodedToken.c_nonce,
        aud: context.selectedIssuer.credential_audience,
        iat: Math.floor(new Date().getTime() / 1000),
        exp: Math.floor(new Date().getTime() / 1000) + 18000,
      }),
    );
    const preHash = header64 + '.' + payload64;
    context.privateKey =
      'ewogICAgImt0eSI6ICJSU0EiLAogICAgICAgICJrZXlfb3BzIjogWwogICAgICAgICAgICAic2lnbiIsCiAgICAgICAgICAgICJ2ZXJpZnkiLAogICAgICAgICAgICAiZW5jcnlwdCIsCiAgICAgICAgICAgICJkZWNyeXB0IgogICAgICAgIF0sCiAgICAgICAgICAgICJraWQiOiAiZGYwOGVjMjEtOWNlYy00Zjc3LTgxYWItNTAxMTkzNzI3MzgxIiwKICAgICAgICAgICAgICAgICJkIjogIkM2N25YeVZkRmd5bmc1YklvUEpGSDBWQ19Dak83bDlEMVFBYm85dW1RNGtYd0dmZ3V6RWpraUJhRDJtTzFDYUE0RnJpYXpHR2tVNUNkd21ES084TWkzUEJIaHdEMXB1djVjWG0xdHJ5NEVzb01vY2VzRjEyM2c0dkpibjY1ZnJuY0lON3RYT3lCT0t4LWoxUlpUZWZ3SlRiNjBISzBNSzBWWEFyRWduWkZsSVZNRkFSUHJUTm9zWF82LXhfS3pDclA5Vl9iLUlXSVc5cjRaS2I4LVM0U1l3TEQwSzRPd0hvenZmMkcyQzZaZ1JyM0FnTFd1VVo5VnpJZGxVUzJGQklTSEduTUJyd0Z0RDBESkx3d25vRmowLTJDN0RrcnBFY2RPaDJrNGFEN2VhYXMyVERLRHVub1NhRVVpZXdfeTl4ZFN4VS1TNHNBaUhqeWRrR3gxMXlHUSIsCiAgICAgICAgICAgICAgICAgICAgIm4iOiAid1RVN1hrdVlGdG5MYnU3bFRjVFZSWGVXSnRfV0ZuNGJpU0w5RjBZWW42Uy1BM2JlU051Tk9qS0dfbHhDeG1hRW5BMWJhUmk1dFAyNWFnREpzOG5WWmVPLU94MkVoNV9JU0RVQ2NHTFJIaXRQNHdRbDh6ZzNBWTI5ZFhKUU9rRVRxaVVYNVpzUWdvaDhXSlVSU0RpbWFxQWE0VXdxU0ZGMnJNUW1wSVpPYnF4ZlhvRDIxa0Q5UzlVRVI4U1Q2ODN5T245QzdsN3JqOGRpM1RpdkFaWEVLUm0xU0xGZk5sdzdNQUFtMnZEb3d0MFNIMV8teDlENFQzNlhNOF9LbkRDb19waG5FR0c5Q1F6WHBZVG40aXNISmFnUHZzLW1mb3pKbWp5SktEdnpjaXNaSHI2OVJOSm92SDFhZkxKc1UzZXRDeTJNeG43c1VDa2VqcHlTaE1YcEp3IiwKICAgICAgICAgICAgICAgICAgICAgICAgImUiOiAiQVFBQiIsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAicCI6ICI0SEVyaXU1V3h5NnlSWnVIUkxpck1VSFNCNUhFQnpnQVI1eW9sV0FMUnVadTRMUmJWY21RUVBGTHVweVcwVXQzbDM2ZnB3MUVHSkNJUFJEbjl4Q1hhUU50QzBZS1d0YXhBaWpTSjhXZ3dRdkJ3Mzd0R3RjcWxER3JNZTMtQ2kxamt6Z0N6VFFoS3FkRGtFRkJzcHgyQnh6RVVidkhVcWtRQmlzdjZjX1pBTXMiLAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICJxIjogIjNGX0lzU3RKZUh1WjBWaXdGOXdpSk44TVBNSWVXTmZXeUlET1JncXBqSTJEdGE2a081SC05UFN3M1hZTHIwbDZyTXA4MERUX2FqYU1qWHZpNTgzTmlROEJROGFXS09vaXpaSjM0V3Ezbm5MMlM0TlVKZ01nSDdQVU80UVNKampMWEN2alh3dEhQekdUR1FfM0pLRzV0YWM4LU12YXVxUjB3NmREaU5XNS1aVSIsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICJkcCI6ICJ3MzF2T3J5c015T1dQWkRoT2xkTExVVXlaa3R0bmdnR0hsbnljT0ZPRVR4RzJVdmV2aE1wcFpkR3FjMFloRVlpYlg3cUdud3drdURZLWEtUERDQ1VjUEI5LXpMUGRCM0o0YUtpb2VlLVJFYzBSMDUzd1VnbW14dkVER0pLUXAwVVBUZXRJUVZGMmp3RVdsS3NvYUVzSUxmS3U1SS1ZOTVEeWN1MkdRWmo4ZzgiLAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgImRxIjogIkNVN0NXemxJMFIzblVVQTlyOFJNYk9JLTBoSWcxZl9Id3BBdUppY3RJaEtZRFlSaXkyRlBNMmxpVHZnOVpobmtaSWZvM2FKZlowMEdnck5JMGlHUEhNclZjdGRnWURvRFhrdGhaTlB0RFhRdGt1THBHdkhtMldfdTl0U05MN0FXWnI0enpEX2RzbjJWaU9senRzaGQzNTVBcFFGM0s0cm1vNXpjN1ZxWmtFRSIsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgInFpIjogIm02dTVzNUhFcmF3YlpXN0JhSHhtQmNHOGVkc0xqamVERFVaZ0xSV3pqS2NPRVpVZ3hUanBlckFvWFdfZ084ZlJCN2YyaC1UZnVaZEhZTXlJdHY0b2YtQlh4MGVtUzZtOG92NGlzLW80aFVqeGxYUkJ0U3lheTRmckM5TUJSUzdKNG9tTGJPOXhCOFhGZ2RqbS16a2x5X3BDNlVaSkQycjJlSmpsNDNHYi01TSIKfQ==';

    const signature64 = await createSignature(
      context.privateKey,
      preHash,
      Issuers_Key_Ref,
    );
    return header64 + '.' + payload64 + '.' + signature64;
  } catch (e) {
    console.log(e);
    throw e;
  }
};

export const vcDownloadTimeout = async (): Promise<number> => {
  const response = await getAllConfigurations();

  return Number(response['openId4VCIDownloadVCTimeout']) || 30000;
};

// OIDCErrors is a collection of external errors from the OpenID library or the issuer
export enum OIDCErrors {
  OIDC_FLOW_CANCELLED_ANDROID = 'User cancelled flow',
  OIDC_FLOW_CANCELLED_IOS = 'org.openid.appauth.general error -3',

  INVALID_TOKEN_SPECIFIED = 'Invalid token specified',
  OIDC_CONFIG_ERROR_PREFIX = 'Config error',
}
// ErrorMessage is the type of error message shown in the UI
export enum ErrorMessage {
  NO_INTERNET = 'noInternetConnection',
  GENERIC = 'generic',
  REQUEST_TIMEDOUT = 'requestTimedOut',
}
