import React, { useEffect } from "react";
import numeral from "numeral";
import { switchOrganization } from "../../../actions/organization";
import analyticsLogger from "../../../util/analyticsLogger";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@apollo/client";
import { PAGINATED_ORGANIZATIONS } from "../../../graphql/organizations";
import { SkeletonLayout } from "../../common/SkeletonLayout";
import { Typography, Button } from "antd";
import MobileTableRow from "../../common/MobileTableRow";
const { Text } = Typography;
import ErrorMessage from "../../common/ErrorMessage";

const MobileOrganizationIndex = ({ user }) => {
  const { loading, error, data, refetch } = useQuery(PAGINATED_ORGANIZATIONS, {
    variables: { page: 1, pageSize: 10 },
    fetchPolicy: "cache-first",
  });

  const dispatch = useDispatch();
  const socket = useSelector((state) => state.apollo.socket);
  const currentOrganizationId = useSelector(
    (state) => state.organization.currentOrganizationId
  );
  const channel = socket.channel("graphql:orgs_index_table", {});
  const user_id = user.sub.startsWith("auth0") ? user.sub.slice(6) : user.sub;

  useEffect(() => {
    channel.join();
    channel.on(
      `graphql:orgs_index_table:${user_id}:organization_list_update`,
      (message) => {
        refetch();
      }
    );

    return () => {
      channel.leave();
    };
  }, []);

  if (error) {
    return <ErrorMessage />;
  }

  return (
    <div>
      <div style={{ padding: 15 }}>
        <Text style={{ fontSize: 32, fontWeight: 600 }}>All Organizations</Text>
      </div>
      {loading && <SkeletonLayout />}
      {data && data.organizations && (
        <div>
          <Text
            style={{
              marginLeft: 15,
              marginBottom: 10,
              fontWeight: 600,
              fontSize: 16,
              display: "block",
            }}
          >
            {data.organizations.entries.length} Organizations
          </Text>
          {data.organizations.entries.map((org) => (
            <MobileTableRow
              id={org.id}
              key={org.id}
              mainTitle={org.name}
              subtext={`${
                org.dc_balance ? numeral(org.dc_balance).format("0,0") : 0
              } DC`}
              rightAction={
                currentOrganizationId === org.id ? (
                  <Text style={{ fontSize: 16 }}>Current</Text>
                ) : (
                  <Button
                    type="primary"
                    style={{ borderRadius: 4 }}
                    onClick={() => {
                      analyticsLogger.logEvent("ACTION_SWITCH_ORG", {
                        id: org.id,
                      });
                      dispatch(switchOrganization(org));
                    }}
                  >
                    Switch
                  </Button>
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileOrganizationIndex;
