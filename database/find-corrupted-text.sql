SET SESSION group_concat_max_len = 1000000;

SELECT GROUP_CONCAT(
    CONCAT(
        'SELECT ',
        QUOTE(TABLE_NAME),
        ' AS tabela, ',
        QUOTE(COLUMN_NAME),
        ' AS campo, COUNT(*) AS registros FROM `',
        REPLACE(TABLE_NAME, '`', '``'),
        '` WHERE LOCATE(UNHEX(''E2949C''), `',
        REPLACE(COLUMN_NAME, '`', '``'),
        '`) > 0 HAVING COUNT(*) > 0'
    )
    SEPARATOR ' UNION ALL '
)
INTO @sql
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND DATA_TYPE IN (
    'char', 'varchar', 'tinytext', 'text',
    'mediumtext', 'longtext'
);

SET @sql = COALESCE(
    @sql,
    'SELECT ''Nenhum campo textual encontrado'' AS resultado'
);

PREPARE verificacao FROM @sql;
EXECUTE verificacao;
DEALLOCATE PREPARE verificacao;
