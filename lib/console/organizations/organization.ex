defmodule Console.Organizations.Organization do
  use Ecto.Schema
  import Ecto.Changeset
  alias Console.Helpers
  alias Console.Organizations.Organization

  @discovery_mode_org_name "Discovery Mode (Helium)"

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "organizations" do
    field :name, :string
    field :dc_balance, :integer
    field :stripe_customer_id, :string
    field :default_payment_id, :string
    field :automatic_charge_amount, :integer
    field :automatic_payment_method, :string
    field :dc_balance_nonce, :integer
    field :pending_automatic_purchase, :boolean
    field :active, :boolean
    field :received_free_dc, :boolean
    field :webhook_key, :string
    field :flow, :map

    has_many :channels, Console.Channels.Channel, on_delete: :delete_all
    has_many :devices, Console.Devices.Device, on_delete: :delete_all
    has_many :labels, Console.Labels.Label, on_delete: :delete_all
    has_many :memberships, Console.Organizations.Membership, on_delete: :delete_all
    many_to_many :users, Console.Auth.User, join_through: "memberships"
    has_many :invitations, Console.Organizations.Invitation, on_delete: :delete_all
    has_many :api_keys, Console.ApiKeys.ApiKey, on_delete: :delete_all
    has_many :functions, Console.Functions.Function, on_delete: :delete_all
    has_many :memos, Console.Memos.Memo, on_delete: :delete_all
    has_many :events, Console.Events.Event, on_delete: :delete_all

    timestamps()
  end

  @doc false
  def changeset(organization, attrs) do
    attrs = Helpers.sanitize_attrs(attrs, ["name"])

    organization
    |> cast(attrs, [:name, :webhook_key, :flow])
    |> validate_required(:name, message: "Organization Name is required")
    |> validate_length(:name, min: 3, message: "Organization Name must be at least 3 letters")
    |> validate_length(:name, max: 50, message: "Organization Name cannot be longer than 50 characters")
    |> check_against_discovery_name
    |> check_name
    |> put_webhook_key()
  end

  @doc false
  def create_changeset(organization, attrs) do
    organization
    |> changeset(attrs)
  end

  def update_changeset(organization, attrs) do
    organization
    |> cast(attrs, [
      :stripe_customer_id,
      :default_payment_id,
      :dc_balance,
      :automatic_charge_amount,
      :automatic_payment_method,
      :dc_balance_nonce,
      :pending_automatic_purchase,
      :active,
      :received_free_dc,
      :flow,
    ])
  end

  @doc false
  def user_join_changeset(organization, user, attrs) do
    organization
    |> changeset(attrs)
    |> put_assoc(:users, [user])
  end

  defp check_against_discovery_name(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{name: name}} ->
        valid_name = name != @discovery_mode_org_name
        case valid_name do
          false -> add_error(changeset, :message, "Please choose a different organization name")
          true -> changeset
        end
      _ -> changeset
    end
  end

  defp check_name(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true, changes: %{name: name}} ->
        valid_name = Helpers.check_special_characters(name)
        case valid_name do
          false -> add_error(changeset, :message, "Please refrain from using special characters in the org name")
          true -> changeset
        end
      _ -> changeset
    end
  end

  defp put_webhook_key(changeset) do
    case changeset do
      %Ecto.Changeset{valid?: true} ->
        key = Helpers.generate_token(32)
        put_change(changeset, :webhook_key, key)
      _ -> changeset
    end
  end
end
