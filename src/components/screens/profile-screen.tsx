'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMounted } from '@/hooks/use-mounted'
import { useProfileStore } from '@/stores/profile'
import { AnimatePresence, motion } from 'framer-motion'
import type { Session } from 'next-auth'

import { api } from '@/lib/api/api'
import PinForm from '@/components/forms/pin-form'
import { Icons } from '@/components/icons'
import SiteFooter from '@/components/layouts/site-footer'
import SiteHeader from '@/components/layouts/site-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface ProfilesScreenProps {
  session: Session | null
  children: React.ReactNode
}

const ProfilesScreen = ({ session, children }: ProfilesScreenProps) => {
  const router = useRouter()
  const mounted = useMounted()

  // profiles query
  const profilesQuery = api.profile.getAll.useQuery(undefined, {
    enabled: !!session?.user
  })

  // profile store
  const profileStore = useProfileStore()

  // reset profile store on sign out
  React.useEffect(() => {
    if (!session?.user) {
      useProfileStore.persist.clearStorage()
    }
  }, [session?.user])

  if (profileStore.pinForm && mounted) {
    return (
      <AnimatePresence>
        <motion.div
          className='container w-full max-w-screen-2xl'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <PinForm />
        </motion.div>
      </AnimatePresence>
    )
  }

  if (session && !profileStore.profile && mounted) {
    return (
      <motion.div
        className='container flex flex-col items-center justify-center w-full max-w-5xl min-h-screen space-y-8'
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className='text-3xl font-medium text-center sm:text-4xl'>{`Who's`} watching?</h1>
        <div className='flex flex-wrap items-start justify-center gap-2 pb-8 sm:gap-4 md:gap-8'>
          {profilesQuery.isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <Skeleton
                  key={i}
                  className='h-24 rounded aspect-square bg-neutral-700 sm:h-28 md:h-32'
                />
              ))
            : profilesQuery.isSuccess &&
              profilesQuery.data.map((profile) => (
                <Button
                  aria-label='Select profile'
                  key={profile.id}
                  variant='ghost'
                  className='group h-auto flex-col space-y-2 p-0 hover:bg-transparent focus:ring-0 focus:ring-offset-0 active:scale-[0.98] dark:hover:bg-transparent'
                  onClick={() => {
                    useProfileStore.setState({
                      profile: profile,
                      pinForm: profile.pin ? true : false
                    })
                  }}
                >
                  <div className='relative h-24 overflow-hidden rounded shadow-sm aspect-square w-fit group-hover:ring-2 group-hover:ring-slate-50 sm:h-28 md:h-32'>
                    {profile.icon ? (
                      <Image
                        src={profile.icon.href}
                        alt={profile.icon.title}
                        fill
                        sizes='(max-width: 768px) 100vw, 
                          (max-width: 1200px) 50vw, 33vw'
                        priority
                        className='object-cover'
                      />
                    ) : (
                      <Skeleton className='w-full h-full bg-neutral-700' />
                    )}
                  </div>
                  <div className='flex flex-col items-center justify-center gap-5'>
                    <h2 className='text-sm text-slate-400 group-hover:text-slate-50 sm:text-base'>
                      {profile.name}
                    </h2>
                    {profile.pin && (
                      <Icons.lock className='w-4 h-4 text-slate-400' aria-label='Private profile' />
                    )}
                  </div>
                </Button>
              ))}
        </div>
        <Button
          aria-label='Navigate to manage profiles page'
          type='button'
          variant='outline'
          size='lg'
          className='rounded-none'
          onClick={() => router.push('/profiles')}
          disabled={profilesQuery.isLoading || profilesQuery.isError}
        >
          Manage Profiles
        </Button>
      </motion.div>
    )
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <SiteHeader />
      <main className='flex-1'>{children}</main>
      <SiteFooter />
    </div>
  )
}

export default ProfilesScreen