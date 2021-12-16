import React, { useState } from 'react'
import { useQuery } from "@apollo/client";
import { useDispatch } from "react-redux";
import find from 'lodash/find'
import { removeLabelsFromDevice } from "../../../actions/label";
import LabelsBlueIcon from "../../../../img/mobile/label-node-icon-blue.svg";
import LabelCheckedIcon from "../../../../img/mobile/label-row-checked.svg";
import MenuCaret from "../../../../img/channels/mobile/menu-caret.svg";
import { ALL_LABELS } from "../../../graphql/labels";
import MobileTableRow from '../../common/MobileTableRow'
import analyticsLogger from '../../../util/analyticsLogger'
import { Modal, Button, Typography } from 'antd';
const { Text } = Typography

export default ({ open, onClose, device }) => {
  const [showLabelAdd, setShowLabelAdd] = useState(false)

  const dispatch = useDispatch()

  const { loading, error, data } = useQuery(ALL_LABELS, {
    fetchPolicy: "cache-and-network",
    variables: {},
  });

  const closeModal = () => {
    setShowLabelAdd(false)
    onClose()
  }

  return (
    <Modal
      title="Device Labels"
      visible={open}
      onCancel={closeModal}
      centered
      footer={[
        <Button key="back" onClick={closeModal}>
          Cancel
        </Button>
      ]}
      bodyStyle={{ padding: 0 }}
    >
      {
        !showLabelAdd && (
          <div>
            {
              device.labels.map((label, index) => {
                let subText = ""
                if (error) subText = "Could not load device count"
                if (data && data.allLabels.length > 0) {
                  const foundLabel = find(data.allLabels, { id: label.id })
                  if (foundLabel) subText = `${foundLabel.device_count} Device${foundLabel.device_count === 1 ? "" : "s"}`
                }
                return (
                  <MobileTableRow
                    key={label.id}
                    mainTitle={<span><img src={LabelsBlueIcon} style={{ height: 14, marginRight: 8 }} />{label.name}</span>}
                    subtext={subText}
                    rightAction={
                      <img
                        src={LabelCheckedIcon}
                        style={{ height: 20, cursor: 'pointer' }}
                        onClick={() => dispatch(removeLabelsFromDevice([label], device.id))}
                      />
                    }
                    onClick={() => {}}
                    borderTop={index === 0}
                    borderBottom={true}
                  />
                )
              })
            }
            <MobileTableRow
              mainTitle={<span><img src={LabelsBlueIcon} style={{ height: 14, position: 'relative', top: -2, marginRight: 8 }} />Add to Label</span>}
              subtext={""}
              rightAction={<img src={MenuCaret} style={{ height: 14, marginRight: 8}} />}
              onClick={() => setShowLabelAdd(true)}
              borderTop={device.labels.length === 0}
              borderBottom={true}
            />
          </div>
        )
      }
    </Modal>
  )
}
