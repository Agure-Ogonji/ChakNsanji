"use client"
import { Agency } from '@prisma/client'
import React, { useEffect, useState } from 'react'
import { useToast } from '../ui/use-toast'
import { useRouter } from 'next/navigation'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { useForm } from 'react-hook-form'
import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
// import FileUpload from '../global/file-upload'

// agencyLogo String @db.Text - to be returned to schema.prisma file
import { Input } from '../ui/input'
import { Switch } from '../ui/switch'
import { deleteAgency, initUser, saveActivityLogsNotification,updateAgencyDetails, upsertAgency } from '@/lib/queries'
import { Button } from '../ui/button'
import {v4} from 'uuid'
import {NumberInput} from '@tremor/react'
import Loading from '../global/loading'
// import { useEdgeStore } from '@/lib/edgestore'
import Link from 'next/link'
type Props = {
    data?:Partial<Agency>
}

const FormSchema = z.object({
    name: z.string().min(2, {message:"Agency Name Must Be At Least 2 Chars."}),
    companyEmail:z.string().min(1),
    companyPhone:z.string().min(1),
    whiteLabel: z.boolean(),
    address:z.string().min(1),
    city:z.string().min(1),
    zipCode:z.string().min(1),
    state:z.string().min(1),
    country:z.string().min(1),
    // agencyLogo:z.string().min(1),
})
const AgencyDetails = ({data}: Props) => {
    const {toast} = useToast()
    const router = useRouter()

    const [deletingAgency, setDeletingAgency] = useState(false)
    const form = useForm<z.infer<typeof FormSchema>>({
        mode:"onChange",
        resolver:zodResolver(FormSchema),
        defaultValues:{
            name: data?.name,
            companyEmail: data?.companyEmail,
            companyPhone: data?.companyPhone,
            whiteLabel: data?.whiteLabel || false,
            address: data?.address,
            city: data?.city,
            zipCode: data?.zipCode,
            state: data?.state,
            country: data?.country,
            // agencyLogo: data?.agencyLogo,
        }
    })

    const isLoading = form.formState.isSubmitting
    useEffect(()=>{if(data){form.reset(data)}}, [data])
    const handleSubmit = async(values: z.infer<typeof FormSchema>) => {
        try {
            let newUserData
            let custId
            if(!data?.id){
                const bodyData = {
                    email: values.companyEmail,
                    name: values.name,
                    shipping:{
                        address:{
                            city: values.city,
                            country: values.country,
                            line1: values.address,
                            postal_code: values.zipCode,
                            state: values.zipCode,
                        },
                        name: values.name,
                    },
                    
                    address:{
                        city: values.city,
                        country: values.country,
                        line1: values.address,
                        postal_code: values.zipCode,
                        state: values.zipCode,
                    },
                }
                const customerResponse = await fetch('/api/stripe/create-customer', {
                    method: "POST",
                    headers:{
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(bodyData),
                })
                const customerData: {customerId: string} = await customerResponse.json()
                custId = customerData.customerId
            }
            newUserData = await initUser({role: "AGENCY_OWNER"})
            if(!data?.customerId && !custId) return
            const response = await upsertAgency({
                id: data?.id ? data.id : v4(),
                customerId: data?.customerId || custId || '',
                address: values.address,
                // agencyLogo: values.agencyLogo,
                city: values.city,
                companyPhone: values.companyPhone,
                country: values.country,
                name: values.name,
                state: values.state,
                whiteLabel: values.whiteLabel,
                zipCode: values.zipCode,
                createdAt: new Date(),
                updatedAt: new Date(),
                companyEmail: values.companyEmail,
                connectAccountId: '',
                goal: 5,
            })
            toast({
                title: 'Created Agency',
            })
            if(data?.id) return router.refresh()
            if(response){
                return router.refresh()
            }
        } catch (error) {
            console.log(error);
            toast({
                variant: 'destructive',
                title: 'Oppse!',
                description: 'NOT ABLE TO CREATE YOUR AGENCY'
            })
            
        }
    }
    const handleDeleteAgency = async () => {
        if(!data?.id) return
        setDeletingAgency(true)
        try {
            const response = await deleteAgency(data.id)
            toast({
                title: 'Deleted Agency',
                description: 'DELETED YOUR AGENCY AND ALL SUBACCOUNTS',
            })
            router.refresh()
        } catch (error) {
            console.log(error);
            toast({
                variant: 'destructive',
                title: 'Oppse!',
                description: 'NOT ABLE TO DELETE YOUR AGENCY',
            })
            
        }
        setDeletingAgency(false)
    }

    
    // const [file, setFile] = useState<File>();
    // const [urls, setUrls] = useState<{
    //     url: string;
    //     thumbnailUrl: string | null;
    // }>();
    // const {edgestore} = useEdgeStore();
  return (
    <AlertDialog>
        <Card className='w-full'>
            <CardHeader className='text-center'>
                <CardTitle>AGENCY INFORMATION</CardTitle>
                <CardDescription>
                    CREATE AN AGENCY FOR THE BUSINESS. EDIT THE AGENCY SETTINGS FROM THE SETTINGS TAB.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
                        {/* <FormField disabled={isLoading} control={form.control} name='agencyLogo' render={({field})=>(
                            <FormItem>
                                <FormLabel>AGENCY LOGO</FormLabel>
                                <FormControl>
                                    <input type='file' onChange={(e) =>{
                                        setFile(e.target.files?.[0])
                                    }}/>
                                    <button className='bg-white text-black rounded px-2 hover:opacity-80' onClick={async()=>{
                                        if(file){
                                            const res = await edgestore.myPublicImages.upload({file});
                                            setUrls({
                                                url: res.url,
                                                thumbnailUrl: res.thumbnailUrl,
                                            })
                                        }
                                    }}>Upload</button>
                                    {urls?.url && <Link href={urls.url} target='_blank'>URL</Link>}
                                    {urls?.thumbnailUrl && <Link href={urls.thumbnailUrl} target='_blank'>THUMBNAIL</Link>}
                                    <FileUpload apiEndpoint='agencyLogo' onChange={field.onChange} value={field.value}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>)}/> */}
                            <div className='flex md:flex-row gap-4'>
                                <FormField disabled={isLoading} control={form.control} name='name' render={({field})=>(
                                    <FormItem className='flex-1'>
                                        <FormLabel>AGENCY NAME</FormLabel>
                                        <FormControl>
                                            <Input placeholder='YOUR AGENCY NAME' {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name='companyEmail' render={({field})=>(
                                    <FormItem className='flex-1'>
                                        <FormLabel>AGENCY EMAIL</FormLabel>
                                        <FormControl>
                                            <Input readOnly placeholder='EMAIL' {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}/>
                            </div>
                            
                            <div className='flex md:flex-row gap-4'>
                                <FormField disabled={isLoading} control={form.control} name='companyPhone' render={({field})=>(
                                    <FormItem className='flex-1'>
                                        <FormLabel>AGENCY PHONE NUMBER</FormLabel>
                                        <FormControl>
                                            <Input placeholder='PHONE' {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}/>
                            </div>
                            
                            <FormField disabled={isLoading} control={form.control} name='whiteLabel' render={({field})=>{
                                return(

                                    <FormItem className='flex flex-row items-center justify-between rounded-lg border gap-4 p-4'>
                                        <div>
                                            <FormLabel>WHITELABEL AGENCY</FormLabel>
                                            <FormDescription>
                                                Turn on WhiteLabel Mode To Display Your Agency Logo To All SubAccounts
                                                by Default. You can Overwrite this Functionality Through SubAccounts Settings 
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange}/>
                                        </FormControl>
                                    </FormItem>
                                )}}/>
                                <FormField disabled={isLoading} control={form.control} name='address' render={({field})=>(
                                    <FormItem className='flex-1'>
                                        <FormLabel>ADDRESS</FormLabel>
                                        <FormControl>
                                            <Input placeholder='123 st...' {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}/>
                                <div className='flex md:flex-row gap-4'>
                                    <FormField disabled={isLoading} control={form.control} name='city' render={({field})=>(
                                        <FormItem className='flex-1'>
                                            <FormLabel>CITY</FormLabel>
                                            <FormControl>
                                                <Input placeholder='CITY' {...field}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}/>
                                    <FormField disabled={isLoading} control={form.control} name='state' render={({field})=>(
                                        <FormItem className='flex-1'>
                                            <FormLabel>STATE</FormLabel>
                                            <FormControl>
                                                <Input placeholder='STATE' {...field}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}/>
                                    <FormField disabled={isLoading} control={form.control} name='zipCode' render={({field})=>(
                                        <FormItem className='flex-1'>
                                            <FormLabel>ZipCode</FormLabel>
                                            <FormControl>
                                                <Input placeholder='ZipCode' {...field}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}/>
                                </div>
                                    <FormField disabled={isLoading} control={form.control} name='country' render={({field})=>(
                                        <FormItem className='flex-1'>
                                            <FormLabel>COUNTRY</FormLabel>
                                            <FormControl>
                                                <Input placeholder='COUNTRY' {...field}/>
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}/>
                                {data?.id && (
                                    <div className='flex flex-col gap-2'>
                                        <FormLabel>Create A Goal</FormLabel>
                                        <FormDescription>
                                            Create a goal for your agency. As your business grows
                                            your goals grow too; so dont forget to set the bar higher!✨
                                        </FormDescription>
                                        <NumberInput defaultValue={data?.goal} onValueChange={async(val)=>{
                                            if(!data?.id) return
                                            await updateAgencyDetails(data.id, {goal: val})
                                            await saveActivityLogsNotification({
                                                agencyId: data.id,
                                                description:`Updated the agency goal to | ${val} Sub Account`,
                                                subaccountId: undefined,
                                            })
                                            router.refresh()
                                        }}
                                        min={1}
                                        className="bg-background !border !border-input"
                                        placeholder="SubAccount Goal"
                                        />
                                    </div>
                                )}
                                <Button type='submit' disabled={isLoading}>
                                    {isLoading ? <Loading/> : "SAVE AGENCY INFORMATION"}
                                </Button>
                    </form>
                </Form>
                {data?.id &&(
                    <div className='flex flex-row items-center justify-between rounded-lg border border-destructive gap-4 p-4 mt-4'>
                        <div>
                            <div>Danger Zone</div>
                        </div>
                        <div className='text-muted-foreground'>
                            Deleting your agency cannpt be undone. This will also delete all
                            sub accounts and all data related to your sub accounts. Sub
                            accounts will no longer have access to funnels, contacts etc.
                        </div>
                        <AlertDialogTrigger disabled={isLoading || deletingAgency} className='text-red-600 p-2 text-center mt-2 rounded-md hover:bg-red-600 hover:text-white whitespace-nowrap'>
                            {deletingAgency ? "Deleting..." : "Dlete Agency"}
                        </AlertDialogTrigger>
                    </div>
                )}
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className='text-left'>
                            Are you Absolutely Sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className='text-left'>
                            This action cannot be undone. This will permanently delete the
                            Agency account and all related sub accounts.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='flex items-center'>
                        <AlertDialogCancel className='mb-2'>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction disabled={deletingAgency} className='bg-destructive hover:bg-destructive' onClick={handleDeleteAgency}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </CardContent>
        </Card>
    </AlertDialog>
  )
}

export default AgencyDetails