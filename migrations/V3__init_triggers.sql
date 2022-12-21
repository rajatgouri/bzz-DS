IF  NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TR_FixIDValue]') AND type in (N'P', N'PC'))
BEGIN
EXEC('
CREATE TRIGGER [dbo].[TR_FixIDValue]
   ON  BillingDataCollection
   AFTER  INSERT,UPDATE, DELETE
AS
BEGIN
	SET NOCOUNT ON;
	EXEC FixIDColumn;
END;
    ')
END

IF  NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TR_UpdateIDValue]') AND type in (N'P', N'PC'))
BEGIN
EXEC('
CREATE TRIGGER [dbo].[TR_UpdateIDValue]
   ON  BillingMAHMOUD
   AFTER  INSERT,UPDATE, DELETE
AS
BEGIN
	SET NOCOUNT ON;
	EXEC SetIDColumn;
END;
    ')
END