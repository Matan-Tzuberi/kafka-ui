import { render } from 'lib/testHelpers';
import React from 'react';
import Query from 'components/KsqlDb/Query/Query';
import { screen, waitFor, within } from '@testing-library/dom';
import fetchMock from 'fetch-mock';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import { clusterKsqlDbQueryPath } from 'lib/paths';

const clusterName = 'testLocal';
const renderComponent = () =>
  render(
    <Route path={clusterKsqlDbQueryPath(':clusterName')}>
      <Query />
    </Route>,
    {
      pathname: clusterKsqlDbQueryPath(clusterName),
    }
  );

describe('Query', () => {
  it('renders', () => {
    renderComponent();

    expect(screen.getByLabelText('KSQL')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Stream properties (JSON format)')
    ).toBeInTheDocument();
  });

  it('fetch on execute', async () => {
    renderComponent();

    const mock = fetchMock.postOnce(
      `/api/clusters/${clusterName}/ksql/v2`,
      200
    );

    await waitFor(() =>
      userEvent.paste(
        within(screen.getByLabelText('KSQL')).getByRole('textbox'),
        'show tables;'
      )
    );

    await waitFor(() =>
      userEvent.click(screen.getByRole('button', { name: 'Execute' }))
    );
    expect(mock.calls().length).toBe(1);
  });
});
