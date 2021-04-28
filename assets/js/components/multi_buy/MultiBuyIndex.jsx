import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../common/DashboardLayout';
import TableHeader from '../common/TableHeader';
import MultiBuyForm from './MultiBuyForm';
import PlusIcon from '../../../img/multi_buy/multi-buy-index-plus-icon.svg';
import AllIcon from '../../../img/multi_buy/multi-buy-index-all-icon.svg';
import AddResourceButton from '../common/AddResourceButton';
import { ALL_MULTI_BUYS } from '../../graphql/multiBuys';
import { useQuery } from '@apollo/client';
import { SkeletonLayout } from '../common/SkeletonLayout';
import { useHistory } from 'react-router-dom'

export default (props) => {
  const history = useHistory();
  const [showPage, setShowPage] = useState('allMultiBuy');
  const currentOrganizationId = useSelector(state => state.organization.currentOrganizationId);
  const { loading, error, data, refetch } = useQuery(ALL_MULTI_BUYS, { fetchPolicy: 'cache-first' });

  return (
    <DashboardLayout
      title="Multiple Packets"
      user={props.user}
      noAddButton
    >
      <TableHeader
        backgroundColor='#D3E0EE'
        otherColor='#ACC6DD'
        homeIcon={null}
        goToAll={() => {
          setShowPage('allMultiBuy');
        }}
        allIcon={AllIcon}
        textColor='#3C6B95'
        allText='All Multiple Packets'
        allButtonStyles={{ width: 160 }}
        onAllPage={showPage === 'allMultiBuy'}
        onNewPage={showPage === 'new'}
        addIcon={PlusIcon}
        goToNew={() => {
          setShowPage('new');
        }}
        noHome
        borderRadius='25px'
      >
        {
          showPage === 'allMultiBuy' && error && <Text>Data failed to load, please reload the page and try again</Text>
        }
        {
          showPage === 'allMultiBuy' && loading && (
            <div style={{ padding: 40 }}><SkeletonLayout /></div>
          )
        }
        {
          showPage === 'allMultiBuy' && !loading && (
            <div />
          )
        }
        {
          showPage === 'new' && <MultiBuyForm fromPage="new" setShowPage={setShowPage} />
        }
      </TableHeader>
      <AddResourceButton />
    </DashboardLayout>
  )
}
