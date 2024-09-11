import AgencyDetails from '@/components/forms/agency-details'
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { currentUser } from '@clerk/nextjs/server'
import { Plan } from '@prisma/client'
import { redirect } from 'next/navigation'
import React from 'react'

const Page = async({searchParams}: {searchParams:{plan:Plan; state:string; code:string}}) => {
  // const authUser = await currentUser()
  // if(!authUser) return redirect('/sign-in')

    const agencyId = await verifyAndAcceptInvitation()
    console.log(agencyId);
    
    //GET USER DETAILS
    const user = await getAuthUserDetails()
    if(agencyId){
      if(user?.role === "SUBACCOUNT_GUEST" || user?.role === "SUBACCOUNT_USER"){
        return redirect("/subaccount")
      }
      else if(user?.role === "AGENCY_OWNER" || user?.role === "AGENCY_ADMIN"){
        if(searchParams.plan){
          return redirect(`/agency/${agencyId}/billing?plan=${searchParams.plan}`)
        }
        if(searchParams.state){
          const statePath = searchParams.state.split("__")[0];
          const stateAgencyId = searchParams.state.split("___")[1];
          if(!stateAgencyId) return <div>Not Authorized</div>
          return redirect(`/agency/${stateAgencyId}/${statePath}?code=${searchParams.code}`)
        }else return redirect(`/agency/${agencyId}`)
      }else {
        return <div>Not Authorized</div>
      }
    }
    const authUser = await currentUser()
    return <div className='flex justify-center items-centers mt-4'>
      
      <div className='max-w-[850px] border-[1px] rounded-xl'>
        <h1 className='text-4xl text-center'>CREATE AN AGENCY</h1>
        <AgencyDetails data={{companyEmail:authUser?.emailAddresses[0].emailAddress}}/>
      </div>
    </div>
}


export default Page