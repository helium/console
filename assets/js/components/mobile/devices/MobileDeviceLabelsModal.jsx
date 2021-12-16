import React, { Component } from 'react'
import { useQuery } from "@apollo/client";
import find from 'lodash/find'
import { ALL_LABELS } from "../../../graphql/labels";
import MobileTableRow from '../../common/MobileTableRow'
import analyticsLogger from '../../../util/analyticsLogger'
import { Modal, Button, Typography } from 'antd';
const { Text } = Typography

export default ({ open, onClose, device }) => {
  const { loading, error, data } = useQuery(ALL_LABELS, {
    fetchPolicy: "cache-and-network",
    variables: {},
  });

  return (
    <Modal
      title="Device Labels"
      visible={open}
      onCancel={onClose}
      centered
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>
      ]}
      bodyStyle={{ padding: 0 }}
    >
      {
        device.labels.map((label, index) => {
          let subText = ""
          if (data && data.allLabels.length > 0) {

          }
          return (
            <MobileTableRow
              key={label.id}
              mainTitle={label.name}
              subtext={"hkjgal"}
              rightAction={<span />}
              onClick={() => {}}
              borderTop={index === 0}
              borderBottom={true}
            />
          )
        })
      }
    </Modal>
  )
}
