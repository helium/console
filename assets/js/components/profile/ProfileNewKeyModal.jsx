import React from 'react';
import { Typography, Button, Modal } from 'antd';
const { Text } = Typography

const ProfileNewKeyModal = ({ newKey, onClose }) => (
  <Modal
    title="Your New API Key"
    visible={!!newKey}
    onCancel={onClose}
    centered
    footer={[
      <Button key="submit" type="primary" onClick={onClose}>
        I have copied my new API key
      </Button>
    ]}
  >
    <div style={{ marginBottom: 20 }}>
      <Text>This key will be displayed to you on this occasion only. You will have to generate a new key if you lose this one.</Text>
    </div>
    {
      newKey && (
        <div>
          <Text>{newKey.key}</Text>
          <div style={{ marginTop: 20 }}>
            <Text strong>Key Name: {newKey.name}</Text><br />
            <Text strong>Key Role: {newKey.role}</Text><br />
          </div>
        </div>
      )
    }
    <div style={{ marginTop: 20 }}>
      <Text>Please check your email for a confirmation to activate this key.</Text>
    </div>
  </Modal>
)

export default ProfileNewKeyModal
