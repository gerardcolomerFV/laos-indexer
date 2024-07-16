export const buildTokenQueryBase = `
  SELECT 
    la.token_id AS "tokenId", 
    COALESCE(a.owner, la.initial_owner) AS "owner",
    la.initial_owner AS "initialOwner",
    la.created_at AS "createdAt", 
    la.log_index AS "logIndex",
    m.token_uri_id AS "tokenUri",
    m.block_number,
    m.tx_hash,
    m."timestamp" as "updatedAt",
    tu.state AS "tokenUriFetchState",
    tu.name AS name,
    tu.description AS description,
    tu.image AS image,
    tu.attributes AS attributes,
    oc.id AS "contractAddress"
  FROM laos_asset la
  INNER JOIN ownership_contract oc ON LOWER(la.laos_contract) = LOWER(oc.laos_contract)
  INNER JOIN metadata m ON la.metadata = m.id
  INNER JOIN token_uri tu ON m.token_uri_id = tu.id
  LEFT JOIN asset a ON la.token_id = a.token_id AND a.ownership_contract_id = oc.id
`;

export const buildTokenByIdQuery = `
  WITH contract_data AS (
    SELECT LOWER(laos_contract) AS laos_contract,
    LOWER(id) as ownership_contract
    FROM ownership_contract
    WHERE LOWER(id) = $1
  )
  SELECT 
    la.token_id AS "tokenId",
    COALESCE(a.owner, la.initial_owner) AS owner,
    la.initial_owner as "initialOwner",
    la.created_at as "createdAt",
    m.token_uri_id AS "tokenUri",
    m.block_number,
    m.tx_hash,
    m."timestamp" as "updatedAt",
    tu.state AS "tokenUriFetchState",
    tu.name AS name,
    tu.description AS description,
    tu.image AS image,
    tu.attributes AS attributes,
    cd.ownership_contract as "contractAddress"
  FROM laos_asset la
  INNER JOIN contract_data cd ON LOWER(la.laos_contract) = cd.laos_contract
  INNER JOIN metadata m ON la.metadata = m.id
  INNER JOIN token_uri tu ON m.token_uri_id = tu.id
  LEFT JOIN asset a ON (la.token_id = a.token_id AND LOWER(cd.ownership_contract) = LOWER(a.ownership_contract_id))
  WHERE la.token_id = $2 AND cd.laos_contract IS NOT null
`;
