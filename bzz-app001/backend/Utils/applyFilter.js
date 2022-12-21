let Utils = {}

const fns = {
    'filter': (value, key, filterQuery) => {
        let values = value


        if (values.indexOf('null') > -1 || values.indexOf(0) > -1 ||   values.indexOf('') > -1 || values.indexOf(null) > -1) {
            values.push('')
            valueQuery = values.map(v =>  v ? ("'" + v.toString().replace(/'/ig, "''") + "'" ) : "'null'")
            filterQuery +=  values   !== null ? "(CONVERT(NVARCHAR(MAX),[" + key + "]) IN (" + valueQuery + ") or " : "";
            filterQuery +=   "CONVERT(NVARCHAR(MAX),[" + key + "]) IS NULL) and "
            return (filterQuery)

        } else {

            valueQuery = values.map(v => ("'" + v.toString().replace(/'/ig, "''") + "'"))
            if (values.length > 0) {
                filterQuery += value !== null ? "CONVERT(NVARCHAR(MAX),[" + key + "]) IN (" + valueQuery + ") and " : "";
                return (filterQuery)

            }
        }

    },
    
    'boolean': (value, key,filterQuery) => {
        let values = value;
        if (values.length < 2 && values[0] == 0) {
            filterQuery += "CONVERT(NVARCHAR(MAX), [" + key + "]) NOT IN ( '' )  and " 
            return (filterQuery)

        } else if ((values.length < 2 && values[0] == 1)) {
            filterQuery += "(CONVERT(NVARCHAR(MAX), [" + key + "]) IN ( '' ) or ["+ key +"] IS NULL) and " ;
            return (filterQuery)

        } 

    },
    'date': (value, key,filterQuery) => {
        value = value.toString().replace(/'/ig, "''")
        filterQuery += value !== null ? ('CAST ([' + key + '] as Date) ') + " =  FORMAT(TRY_CAST('"+ value +"' as date),'yyyy-MM-dd')" + " and " : "";

        // filterQuery += value !== null ? (value.length > 1 ? 'CAST([' + key + '] AS DATE)'  : "[" + key + "]") + " =  CAST('" + value + "' AS DATE)" + " and " : "";
        return (filterQuery)
    },
    'datetime': (value, key,filterQuery) => {
        value = value.toString().replace(/'/ig, "''")
        filterQuery += value !== null ? ('CAST ([' + key + '] as DateTime) ') + " =  FORMAT(TRY_CAST('"+ value +"' as datetime),'yyyy-MM-dd hh:mm:ss')" + " and " : "";

        // filterQuery += value !== null ? (value.length > 1 ? 'CAST([' + key + '] AS DATE)'  : "[" + key + "]") + " =  CAST('" + value + "' AS DATE)" + " and " : "";
        return (filterQuery)
    },
    
    'search': (value, key,filterQuery) => {
        value = value.toString().replace(/'/ig, "''")

        filterQuery += value !== null ? (value.length > 1 ? '[' + key + ']' : "["+key+ "]") + " Like '%" + value + "%' and " : "";  
        return (filterQuery)
    }
}

Utils.getFilters = async (keys, customSwitch) => {
    
    return new Promise(async (resolve, reject) => {
        filterQuery = '';

        let c = Object.keys(keys)

        console.log(keys)
        if(c.length ==0) {
            resolve('')
            return
        }
        for ( key in keys) {

            if (keys[key]['value'] != null && keys[key]['value'].length > 0 ) {


                for  (const { condition, value, type } of customSwitch) {
                    if (key == condition ) {
                        let query 

                        if(type == 'date'  ) {
                            query = await fns['date'](value, key, filterQuery)
                        } else if (  type == 'datetime') {
                            query = await fns['datetime'](value, key, filterQuery)
                        } else if(type == 'search') {
                            query = await fns['search'](value, key, filterQuery)
                        } else if(type == 'boolean') {
                            query = await fns['boolean'](value, key, filterQuery)
                        } else {
                            query = await fns['filter'](value, key, filterQuery)
                        }
                        
                       filterQuery = query ? query : ''
                       break;
                    } 
    
                }
            } 
            
            if (c.indexOf(key) == c.length - 1) {
                resolve(filterQuery)
            } 


        }
    })
    


}


module.exports = Utils


