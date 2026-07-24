--- @param key string The key to store the data under
--- @param value table The data to store
function SaveData(key, value)
    local serializedValue = json.encode(value) -- Convert table to JSON string
    SetResourceKvp(key, serializedValue)
end

--- Load data from KVP
--- @param key string The key to retrieve the data from
--- @return table The loaded data or nil if not found
function LoadData(key)
    local serializedValue = GetResourceKvpString(key)
    if serializedValue and serializedValue ~= "" then
        return json.decode(serializedValue) -- Convert JSON string back to table
    end
    return nil
end

--- Save or load data from KVP
--- @param key string The key to store/retrieve the data
--- @param value table|nil The data to store (if nil, will load data)
--- @return table|nil The loaded data if value is nil, otherwise nil
function Data(key, value)
    if value then
        SaveData(key, value)
        return nil
    else
        return LoadData(key)
    end
end