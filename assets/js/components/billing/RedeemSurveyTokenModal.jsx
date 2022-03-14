import React, { useState } from 'react'
import { submitSurveyToken } from '../../actions/organization'
import { displayInfo } from "../../util/messages";
import { Modal, Button, Typography, Input } from 'antd';
const { Text } = Typography

const RedeemSurveyTokenModal = ({ open, onClose, mobile }) => {
  const [token, setToken] = useState("")

  const handleSubmit = () => {
    submitSurveyToken(token)
    .then(res => {
      displayInfo("Survey token redeemed successfully")
      onClose()
    })
    .catch(() => {
      setToken("")
    })
  }

  return (
    <Modal
      title="Redeem Survey Token"
      visible={open}
      onCancel={onClose}
      centered
      onOk={handleSubmit}
      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Submit
        </Button>,
      ]}
      bodyStyle={{ padding: mobile ? "0px 15px" : "20px 50px 10px 50px"}}
    >
      <div style={{ marginBottom: 20 }}>
        <Text>
          Enter your survey token below to received additional Data Credits. The token is sent to your Console email address approximately 30 minutes after survey submission.
        </Text>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
        <Input
          placeholder="Enter Token"
          name="token"
          value={token}
          onChange={e => setToken(e.target.value)}
          style={{ width: 250 }}
          maxLength={20}
        />
      </div>
    </Modal>
  )
}

export default RedeemSurveyTokenModal
