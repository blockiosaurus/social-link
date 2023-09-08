use anchor_lang::prelude::*;

declare_id!("ProfcvZSpN3rxJAmFzvRhhkvFFrnJzTZU3W9aYey6yV");

#[program]
pub mod solana_profile {
    use super::*;

    pub fn write_account(
        ctx: Context<WriteAccount>,
        encryption_key: Pubkey,
        data: Vec<u8>,
    ) -> Result<()> {
        let profile = &mut ctx.accounts.profile;
        profile.owner = *ctx.accounts.owner.key;
        profile.encryption_key = encryption_key;
        profile.bump = *ctx
            .bumps
            .get("profile")
            .ok_or(ErrorCode::UnableToFindBump)?;
        profile.data = data;
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(encryption_key: Pubkey, data: Vec<u8>)]
pub struct WriteAccount<'info> {
    #[account(init, payer = owner, space = 8 + 32 + 32 + 1 + 4 + data.len(), seeds = [b"profile".as_ref(), encryption_key.as_ref(), owner.key.as_ref()], bump)]
    pub profile: Account<'info, Profile>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Profile {
    pub owner: Pubkey,
    pub encryption_key: Pubkey,
    pub bump: u8,
    pub data: Vec<u8>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unable to find bump.")]
    UnableToFindBump,
}
