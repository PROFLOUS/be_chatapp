const commonUtils ={

    getPagination: (page, size, total) => {
        const totalPages = Math.ceil(total / size);
        const skip = page * size;
        return {
            skip,
            limit: size,
            totalPages,
        };
    },
    
}

module.exports = commonUtils;