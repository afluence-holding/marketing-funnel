import type { NextPageContext } from 'next';

function ErrorPage({ statusCode }: { statusCode: number }) {
  return (
    <p>
      {statusCode
        ? `Error ${statusCode} en el servidor`
        : 'Ocurrió un error en el cliente'}
    </p>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode ?? 500 : 404;
  return { statusCode };
};

export default ErrorPage;
