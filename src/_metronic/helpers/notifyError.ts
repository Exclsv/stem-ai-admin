import { toast } from 'react-toastify';
import { IntlShape } from 'react-intl';

export const notifyError = (
  intl: IntlShape,
  statusCode: number,
  message?: string
) => {
  switch (statusCode) {
    case 422:
      toast.warning(
        message ||
          intl.formatMessage({
            id: 'ERROR.BAD_REQUEST',
            defaultMessage:
              'Bad Request: The server could not understand the request.',
          })
      );
      break;
    case 400:
      toast.warning(
        message ||
          intl.formatMessage({
            id: 'ERROR.BAD_REQUEST',
            defaultMessage:
              'Bad Request: The server could not understand the request.',
          })
      );
      break;
    case 401:
      toast.error(
        message ||
          intl.formatMessage({
            id: 'ERROR.UNAUTHORIZED',
            defaultMessage:
              'Unauthorized: Please login to access this resource.',
          })
      );
      break;
    case 403:
      toast.error(
        message ||
          intl.formatMessage({
            id: 'ERROR.FORBIDDEN',
            defaultMessage:
              'Forbidden: You do not have permission to access this.',
          })
      );
      break;
    case 404:
      toast.error(
        message ||
          intl.formatMessage({
            id: 'ERROR.NOT_FOUND',
            defaultMessage:
              'Not Found: The requested resource could not be found.',
          })
      );
      break;
    case 500:
      toast.error(
        message ||
          intl.formatMessage({
            id: 'ERROR.INTERNAL_SERVER',
            defaultMessage:
              'Bad Gateway: The server is acting as a gateway and received an invalid response.',
          })
      );
      break;
      break;
    case 502:
      toast.error(
        message ||
          intl.formatMessage({
            id: 'ERROR.BAD_GATEWAY',
            defaultMessage:
              'Bad Gateway: The server is acting as a gateway and received an invalid response.',
          })
      );
      break;
    case 503:
      toast.error(
        message ||
          intl.formatMessage({
            id: 'ERROR.SERVICE_UNAVAILABLE',
            defaultMessage:
              'Service Unavailable: The server is currently unavailable.',
          })
      );
      break;
    default:
      toast.error(
        message ||
          intl.formatMessage(
            {
              id: 'ERROR.GENERIC',
              defaultMessage:
                'Error: An unexpected error occurred (Status: {statusCode}).',
            },
            { statusCode }
          )
      );
      break;
  }
};
