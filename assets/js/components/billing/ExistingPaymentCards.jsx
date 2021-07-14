import React from "react";
import { Radio, Typography, Button, Tooltip } from "antd";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
const { Text } = Typography;
import PaymentCard from "./PaymentCard";

const ExistingPaymentCards = ({
  paymentMethods,
  onRadioChange,
  paymentMethodSelected,
  showDelete,
  removePaymentMethod,
}) => (
  <div style={{ marginBottom: 24 }}>
    <Text strong>Choose from Stored Cards</Text>

    <div style={{ maxHeight: 150, overflowY: "scroll" }}>
      <Radio.Group
        onChange={onRadioChange}
        value={paymentMethodSelected}
        style={{ width: "100%" }}
      >
        {paymentMethods.map((p) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Radio value={p.id} />
            <PaymentCard
              key={p.id}
              card={p.card}
              style={{ margin: 4, marginLeft: 8 }}
            />
            {showDelete && (
              <React.Fragment>
                <div style={{ flex: "grow" }} />
                <Tooltip title="Delete Card">
                  <Button
                    type="danger"
                    icon={<DeleteOutlined />}
                    shape="circle"
                    onClick={() => removePaymentMethod(p.id)}
                  />
                </Tooltip>
              </React.Fragment>
            )}
          </div>
        ))}
      </Radio.Group>
    </div>
  </div>
);

export default ExistingPaymentCards;
