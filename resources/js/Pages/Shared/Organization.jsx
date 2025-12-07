import { useState, useEffect } from 'react'
import { Head } from '@inertiajs/react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import OrganizationPill from '@/Components/OrganizationPill'
import { OrganizationData } from '@/../data/OrganizationData'
import Icon from '@/imports/LucideIcon'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { Button } from '@/Components/App/Buttons/Button'
import { Tree, TreeNode as OrgTreeNode } from 'react-organizational-chart'

const CustomTreeNode = ({ data }) => {
    const hasChildren = data.children?.length > 0;

    return (
        <OrgTreeNode label={<OrganizationPill
            name={data.name}
            job={data.job}
            phone={data.phone}
            mail={data.mail}
            image={data.image}
        />}>
            {data.children?.map(child => (
                <CustomTreeNode key={child.id} data={child} />
            ))}
        </OrgTreeNode>
    );
};

export default function Organization() {
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        document.documentElement.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
            document.documentElement.style.overflow = ''
        }
    }, [])

    return (
        <>
            <Head title='Organization Chart' />

            <div className="py-7 bg-custom-white dark:bg-custom-blackLight h-dvh">
                <TransformWrapper
                    initialScale={.8}
                    initialPositionX={0}
                    initialPositionY={0}
                    minScale={0.3}
                    maxScale={2}
                    centerOnInit={true}
                    limitToBounds={false}
                    panning={{ disabled: false, velocityDisabled: false }}
                    velocity={true}
                    wheel={{ step: 0.08 }}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            <div className="fixed top-24 right-10 flex gap-2 z-10">
                                <Button
                                    variant="ghost"
                                    onClick={() => zoomIn()}
                                    size={"icon"}
                                >
                                    <Icon name={"ZoomIn"} className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={"ghost"}
                                    onClick={() => zoomOut()}
                                    size={"icon"}
                                >
                                    <Icon name={"ZoomOut"} className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={"ghost"}
                                    onClick={() => resetTransform()}
                                    className='gap-2'
                                >
                                    <Icon name={"Fullscreen"} className="w-4 h-4" />
                                    Centrar Vista
                                </Button>
                            </div>

                            <TransformComponent
                                wrapperStyle={{
                                    width: '100%',
                                    height: '100%'
                                }}
                                contentStyle={{
                                    width: '100%',
                                    height: '100%'
                                }}
                            >
                                <div className="w-full h-full flex items-center justify-center">
                                    <Tree
                                        lineWidth={'4px'}
                                        lineColor={'#FB7D16'}
                                        lineBorderRadius={'20px'}
                                        label={<OrganizationPill
                                            name={OrganizationData.name}
                                            job={OrganizationData.job}
                                            phone={OrganizationData.phone}
                                            mail={OrganizationData.mail}
                                            image={OrganizationData.image}
                                        />}
                                    >
                                        {OrganizationData.children?.map(child => (
                                            <CustomTreeNode
                                                key={child.id}
                                                data={child}
                                            />
                                        ))}
                                    </Tree>
                                </div>
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>
            </div>
        </>
    )
}

Organization.layout = (page) => (
    <AuthenticatedLayout>
        <div className="max-h-full max-w-full overflow-hidden">
            {page}
        </div>
    </AuthenticatedLayout>
)