IF  NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FixIDColumn]') AND type in (N'P', N'PC'))
BEGIN
EXEC('
 CREATE PROCEDURE [dbo].[FixIDColumn]
AS
BEGIN
	DECLARE @id INT
	SET @id = 0
	UPDATE BillingDataCollection
	SET @id = ID = @id + 1;
END; 
    ')
END

IF  NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SetIDColumn]') AND type in (N'P', N'PC'))
BEGIN
EXEC('
CREATE PROCEDURE [dbo].[SetIDColumn]
AS
BEGIN
	DECLARE @id INT
	SET @id = 0
	UPDATE dbo.BillingMAHMOUD
	SET @id = ID = @id + 1;
END;
    ')
END